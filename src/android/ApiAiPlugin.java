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

public class ApiAiPlugin extends CordovaPlugin implements AIListener {

    private static final String TAG = ApiAiPlugin.class.getName();

    private AIService aiService;
    private Gson gson;

    private CallbackContext currentCallbacks;

    private CallbackContext levelMeterCallback;
    private CallbackContext listeningStartCallback;
    private CallbackContext listeningFinishCallback;
    private CallbackContext listeningCanceledCallback;

    private float maxLevel;
    private float minLevel;

    @Override
    public void initialize(final CordovaInterface cordova, final CordovaWebView webView) {
        super.initialize(cordova, webView);
        
        gson = GsonFactory.getGson();
    }

    @Override
    public boolean execute(final String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
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

            if (argObject != null) {
                final RequestExtras requestExtras = new RequestExtras();
                String query = "";

                if (argObject.has("query")) {
                    query = argObject.getString("query");
                }
                else {
                    callbackContext.error("Argument query must not be empty");
                }

                fillContextsFromArg(argObject, requestExtras);
                fillEntitiesFromArg(argObject, requestExtras);

                if (argObject.has("resetContexts")) {
                    requestExtras.setResetContexts(argObject.getBoolean("resetContexts"));
                }

                this.textRequest(query, requestExtras, callbackContext);
            }
            else{
                callbackContext.error("Arguments is empty");
            }
            
            return true;
        } else if (action.equals("requestVoice")) {

            JSONObject argObject =  args.getJSONObject(0);

            if (argObject != null) {
                final RequestExtras requestExtras = new RequestExtras();

                fillContextsFromArg(argObject, requestExtras);
                fillEntitiesFromArg(argObject, requestExtras);

                if (argObject.has("resetContexts")) {
                    requestExtras.setResetContexts(argObject.getBoolean("resetContexts"));
                }

                this.requestVoice(requestExtras, callbackContext);                
            }
            else{
                this.requestVoice(null, callbackContext);
            }

            return true;
        } else if (action.equals("cancelAllRequests")) {
            this.cancelAllRequests(callbackContext);
            return true;
        } else if (action.equals("stopListening")) {
            this.stopListening(callbackContext);
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
        }

        return false;
    }

    private void fillContextsFromArg(JSONObject argObject, RequestExtras requestExtras) throws JSONException { 
        if (argObject.has("contexts")) {
            final List<AIContext> contexts = new ArrayList<AIContext>();
            final JSONArray arr = argObject.getJSONArray("contexts");
            for (int i = 0; i < arr.length(); i++) {
                final AIContext aiContext = new AIContext(arr.getString(i));
                contexts.add(aiContext);
            }

            requestExtras.setContexts(contexts);
        }
    }

    private void fillEntitiesFromArg(JSONObject argObject, RequestExtras requestExtras) throws JSONException { 
        if (argObject.has("entities")) {
            final JSONArray arr = argObject.getJSONArray("entities");
            Log.d(TAG, "Entities: " + arr.toString());
            final List<Entity> entities = Arrays.asList(gson.fromJson(arr.toString(), Entity[].class));

            if (entities.size() > 0) {
                requestExtras.setEntities(entities);
            }
        }
    }

    public void init(final JSONObject argObject, CallbackContext callbackContext) {
        try{

            final String baseURL = argObject.optString("baseURL", "https://api.api.ai/v1/"); 
            final String clientAccessToken = argObject.getString("clientAccessToken"); 
            final String subscriptionKey = argObject.getString("subscriptionKey"); 
            final String language = argObject.optString("lang", "en");
            final boolean debugMode = argObject.optBoolean("debug", false);
            final String version = argObject.optString("version", "20150415");

            final AIConfiguration.SupportedLanguages lang = AIConfiguration.SupportedLanguages.fromLanguageTag(language);
            final AIConfiguration config = new AIConfiguration(clientAccessToken,
                    subscriptionKey, 
                    lang,
                    AIConfiguration.RecognitionEngine.System);

            if (!TextUtils.isEmpty(version)) {
                config.setProtocolVersion(version);
            }

            aiService = AIService.getService(this.cordova.getActivity().getApplicationContext(), config);
            aiService.setListener(this);

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

    public void stopListening(CallbackContext callbackContext) {
        try {
            aiService.stopListening();
            callbackContext.success();
        } catch(Exception ex){
            Log.e(TAG, "stopListening", ex);
            callbackContext.error(ex.getMessage());
        }
    }

    public void cancelAllRequests(CallbackContext callbackContext){
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

}
