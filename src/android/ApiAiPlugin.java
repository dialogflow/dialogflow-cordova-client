package ai.api;

/***********************************************************************************************************************
 *
 * API.AI Cordova Android SDK
 * =================================================
 *
 * Copyright (C) 2015 by Speaktoit, Inc. (https://www.speaktoit.com)
 * https://www.api.ai
 *
 ***********************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 ***********************************************************************************************************************/

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import android.util.Log;
import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonSyntaxException;

import android.Manifest;
import android.content.pm.PackageManager;

import ai.api.AIConfiguration;
import ai.api.AIListener;
import ai.api.AIService;
import ai.api.RequestExtras;
import ai.api.GsonFactory;
import ai.api.model.AIContext;
import ai.api.model.AIError;
import ai.api.model.AIRequest;
import ai.api.model.AIResponse;
import ai.api.model.Entity;
import ai.api.services.GoogleRecognitionServiceImpl;

public class ApiAiPlugin extends CordovaPlugin implements AIListener {

    private static final String TAG = ApiAiPlugin.class.getName();

    public static final String RECORD_AUDIO = Manifest.permission.RECORD_AUDIO;
    public static final int AUDIO_REQ_CODE = 17;

    private AIService aiService;
    private Gson gson;

    private String persistedAction;
    private JSONArray persistedArgs;

    private CallbackContext currentCallbacks;

    private CallbackContext levelMeterCallback;
    private CallbackContext listeningStartCallback;
    private CallbackContext listeningFinishCallback;
    private CallbackContext listeningCanceledCallback;
    private CallbackContext partialResultsCallback;

    private float maxLevel;
    private float minLevel;

    @Override
    public void initialize(final CordovaInterface cordova, final CordovaWebView webView) {
        super.initialize(cordova, webView);
        
        gson = GsonFactory.getGson();
    }

    @Override
    public boolean execute(final String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        Log.i(TAG, action);

        if (action.equals("init")) {

            final JSONObject argObject =  args.getJSONObject(0);

            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    init(argObject, callbackContext);
                }
            });
            
            return true;
        } else if (action.equals("requestText")) {
            JSONObject argObject =  args.getJSONObject(0);

            if (argObject == null) {
                callbackContext.error("Arguments is empty");
                return true;
            }

            if (!argObject.has("query")) {
                callbackContext.error("Argument query must not be empty");
                return true;
            }

            final RequestExtras requestExtras = new RequestExtras();
            final String query = argObject.getString("query");

            fillContextsFromArg(argObject, requestExtras);
            fillEntitiesFromArg(argObject, requestExtras);

            if (argObject.has("resetContexts")) {
                requestExtras.setResetContexts(argObject.getBoolean("resetContexts"));
            }

            this.cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    textRequest(query, requestExtras, callbackContext);
                }
            });

            return true;
        } else if (action.equals("requestVoice")) {

            if(!cordova.hasPermission(RECORD_AUDIO)) {

                Log.i(TAG, "Requesting audio permissions");

                currentCallbacks = callbackContext;
                persistedAction = action;
                persistedArgs = args;

                getAudioPermission(AUDIO_REQ_CODE);

                return true;
            }

            JSONObject argObject =  args.getJSONObject(0);

            if (argObject != null) {
                final RequestExtras requestExtras = new RequestExtras();

                fillContextsFromArg(argObject, requestExtras);
                fillEntitiesFromArg(argObject, requestExtras);

                if (argObject.has("resetContexts")) {
                    requestExtras.setResetContexts(argObject.getBoolean("resetContexts"));
                }

                this.cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        requestVoice(requestExtras, callbackContext);
                    }
                });
            }
            else {
                this.cordova.getActivity().runOnUiThread(new Runnable() {
                    public void run() {
                        requestVoice(null, callbackContext);
                    }
                });
            }

            return true;
        } else if (action.equals("cancelAllRequests")) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    cancelAllRequests(callbackContext);
                }
            });
            return true;
        } else if (action.equals("stopListening")) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    stopListening(callbackContext);
                }
            });
            return true;
        } else if (action.equals("levelMeterCallback")) {
            setLevelMeterCallback(callbackContext);
            return true;
        } else if (action.equals("listeningStartCallback")) {
            setListeningStartCallback(callbackContext);
            return true;
        } else if (action.equals("listeningFinishCallback")) {
            setListeningFinishCallback(callbackContext);
            return true;
        } else if (action.equals("partialResultsCallback")) {
            setPartialResultsCallback(callbackContext);
            return true;
        } else if (action.equals("recognitionResultsCallback")) {
            callbackContext.error("recognitionResultsCallback is deprecated, use partialResultsCallback instead");
            return true;
        }

        return false;
    }

    private void fillContextsFromArg(JSONObject argObject, RequestExtras requestExtras) throws JSONException { 
        if (argObject.has("contexts")) {
            final JSONArray arr = argObject.getJSONArray("contexts");

            // try parse as objects
            try {
                final List<AIContext> contexts = Arrays.asList(gson.fromJson(arr.toString(), AIContext[].class));
                if (contexts != null && contexts.size() > 0) {
                    requestExtras.setContexts(contexts);
                }
                return;
            } catch (JsonSyntaxException je){
            }

            // try parse as strings
            try {
                final List<String> stringContexts = Arrays.asList(gson.fromJson(arr.toString(), String[].class));

                if (stringContexts != null && stringContexts.size() > 0) {
                    final List<AIContext> contexts = new ArrayList<AIContext>();
                    for (String s : stringContexts) {
                        contexts.add(new AIContext(s));
                    }
                    requestExtras.setContexts(contexts);
                }
            } catch (JsonSyntaxException je){
            }

        }
    }

    private void fillEntitiesFromArg(JSONObject argObject, RequestExtras requestExtras) throws JSONException { 
        if (argObject.has("entities")) {
            final JSONArray arr = argObject.getJSONArray("entities");
            Log.d(TAG, "Entities: " + arr.toString());
            final List<Entity> entities = Arrays.asList(gson.fromJson(arr.toString(), Entity[].class));

            if (entities != null && entities.size() > 0) {
                requestExtras.setEntities(entities);
            }
        }
    }

    protected void getAudioPermission(final int requestCode)
    {
        cordova.requestPermission(this, requestCode, RECORD_AUDIO);
    }

    public void init(final JSONObject argObject, CallbackContext callbackContext) {
        try{

            final String baseURL = argObject.optString("baseURL", "https://api.api.ai/v1/"); 
            final String clientAccessToken = argObject.getString("clientAccessToken"); 
            final String language = argObject.optString("lang", "en");
            final boolean debugMode = argObject.optBoolean("debug", false);
            final String version = argObject.optString("version", "20150910");

            final AIConfiguration.SupportedLanguages lang = AIConfiguration.SupportedLanguages.fromLanguageTag(language);
            final AIConfiguration config = new AIConfiguration(clientAccessToken,
                    lang,
                    AIConfiguration.RecognitionEngine.System);

            if (!TextUtils.isEmpty(version)) {
                config.setProtocolVersion(version);
            }

            aiService = AIService.getService(this.cordova.getActivity().getApplicationContext(), config);
            aiService.setListener(this);

            if (aiService instanceof GoogleRecognitionServiceImpl) {
                ((GoogleRecognitionServiceImpl) aiService).setPartialResultsListener(new PartialResultsListener() {
                    @Override
                    public void onPartialResults(final List<String> partialResults) {
                        ApiAiPlugin.this.onPartialResults(partialResults);
                    }
                });
            }

            callbackContext.success();
        }
        catch(Exception ex){
            Log.e(TAG, "Init", ex);
            callbackContext.error(ex.toString());
        }
    }

    public void textRequest(final String query, final RequestExtras requestExtras, CallbackContext callbackContext){
        try{
            final AIResponse response = aiService.textRequest(query, requestExtras);
            final String jsonResponse = gson.toJson(response);

            final JSONObject jsonObject = new JSONObject(jsonResponse);

            callbackContext.success(jsonObject);
        }
        catch(Exception ex){
            Log.e(TAG, "textRequest", ex);
            callbackContext.error(ex.getMessage());
        }
    }

    public void requestVoice(final RequestExtras requestExtras, final CallbackContext callbackContext){
        try{
           currentCallbacks = callbackContext;

           maxLevel = 10.0f;
           minLevel = 0.0f;

           aiService.startListening(requestExtras);
        }
        catch(Exception ex){
            Log.e(TAG, "requestVoice", ex);
            callbackContext.error(ex.toString());
            //callbackContext.error(ex.getMessage());
            if (callbackContext == currentCallbacks) {
                currentCallbacks = null;
            }
        }
    }

    public void stopListening(final CallbackContext callbackContext) {
        try {
            aiService.stopListening();
            callbackContext.success();
        } catch(Exception ex){
            Log.e(TAG, "stopListening", ex);
            callbackContext.error(ex.getMessage());
        }
    }

    public void cancelAllRequests(final CallbackContext callbackContext){
        try{
           aiService.cancel();
           callbackContext.success();
        }
        catch(Exception ex){
            Log.e(TAG, "cancelAllRequests", ex);
            callbackContext.error(ex.getMessage());
        }
    }

    public void setLevelMeterCallback(final CallbackContext callback){
        levelMeterCallback = callback;
    }

    public void setListeningStartCallback(final CallbackContext callback){
        listeningStartCallback = callback;
    }

    public void setListeningFinishCallback(final CallbackContext callback){
        listeningFinishCallback = callback;
    }

    public void setPartialResultsCallback(final CallbackContext callback){
        partialResultsCallback = callback;
    }

    @Override
    public void onReset() {
        try{
           aiService.cancel();
        }
        catch(Exception ex){
            Log.e(TAG, "onReset", ex);
        }
    }

    /**
     * Called when the system is about to start resuming a previous activity.
     *
     * @param multitasking      Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onPause(boolean multitasking) {
        if (aiService != null) {
            aiService.pause();
        }
    }

    /**
     * Called when the activity will start interacting with the user.
     *
     * @param multitasking      Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onResume(boolean multitasking) {
        if (aiService != null) {
            aiService.resume();
        }
    }

    @Override
    public void onDestroy() {
    }

    @Override
    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException
    {
        if (requestCode == AUDIO_REQ_CODE) {
            if (grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {

                if (persistedAction != null) {

                    final String action = persistedAction;
                    final JSONArray args = persistedArgs;

                    persistedAction = null;
                    persistedArgs = null;

                    execute(action, args, currentCallbacks);
                } else {
                    if (currentCallbacks != null) {
                        currentCallbacks.sendPluginResult(new PluginResult(PluginResult.Status.OK, "PERMISSION_OK"));
                    }
                }
            } else {
                if (currentCallbacks != null) {
                    currentCallbacks.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, "PERMISSION_DENIED_ERROR"));
                }
            }
        }
        else {
            if (currentCallbacks != null) {
                currentCallbacks.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, "Wrong requestCode for permissions"));
            }
        }
    }

    @Override
    public void onResult(final AIResponse response) {
        if (currentCallbacks != null) {
            try{
                
                Log.d(TAG, response.getStatus().getErrorType());

                final String jsonResponse = gson.toJson(response);
                final JSONObject jsonObject = new JSONObject(jsonResponse);

                currentCallbacks.success(jsonObject);
            }
            catch(Exception ex){
                Log.e(TAG, "onReset", ex);
                currentCallbacks.error(ex.getMessage());
            }
            finally{
                currentCallbacks = null;
            }
        }
    }

     @Override
    public void onError(final AIError error) {
        if (currentCallbacks != null) {
            final String errorString = gson.toJson(error);
            currentCallbacks.error(errorString);
            currentCallbacks = null;
        }
    }

    @Override
    public void onAudioLevel(final float level) {
        
        float normLevel = level;

        if (level > maxLevel) {
            maxLevel = maxLevel + (level - maxLevel) / 2;
            normLevel = maxLevel;
        }

        if (level < minLevel) {
            minLevel = minLevel - (minLevel - level) / 2;
            normLevel = minLevel;
        }

        normLevel = (normLevel - minLevel) / (maxLevel - minLevel);

        if (levelMeterCallback != null) {
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, (float)normLevel);
            pluginResult.setKeepCallback(true);
            levelMeterCallback.sendPluginResult(pluginResult);
        }
    }

    @Override
    public void onListeningStarted() {
        if (listeningStartCallback != null) {
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK);
            pluginResult.setKeepCallback(true);
            listeningStartCallback.sendPluginResult(pluginResult);
        }
    }

    @Override
    public void onListeningFinished() {
        if (listeningFinishCallback != null) {
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK);
            pluginResult.setKeepCallback(true);
            listeningFinishCallback.sendPluginResult(pluginResult);
        }
    }

    @Override
    public void onListeningCanceled() {
        if (listeningCanceledCallback != null) {
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK);
            pluginResult.setKeepCallback(true);
            listeningCanceledCallback.sendPluginResult(pluginResult);
        }
    }

    public void onPartialResults(final List<String> results) {
        if (partialResultsCallback != null){
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, gson.toJson(results));
            pluginResult.setKeepCallback(true);
            partialResultsCallback.sendPluginResult(pluginResult);
        }
    }

}
