package ai.api;

/***********************************************************************************************************************
 *
 * API.AI Cordova Android SDK
 * =================================================
 *
 * Copyright (C) 2014 by Speaktoit, Inc. (https://www.speaktoit.com)
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonElement;

import ai.api.AIConfiguration;
import ai.api.AIListener;
import ai.api.AIService;
import ai.api.GsonFactory;
import ai.api.model.AIContext;
import ai.api.model.AIError;
import ai.api.model.AIRequest;
import ai.api.model.AIResponse;

public class ApiAiPlugin extends CordovaPlugin implements AIListener {

    private AIService aiService;
    private Gson gson;

    private CallbackContext currentCallbacks;
    private CallbackContext levelMeterCallback;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        
        gson = GsonFactory.getGson();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("init")) {
            String baseURL = args.getString(0); 
            String clientAccessToken = args.getString(1); 
            String subscriptionKey = args.getString(2); 

            this.init(baseURL,clientAccessToken,subscriptionKey, callbackContext);
            
            return true;
        } else if (action.equals("requestText")) {
            JSONObject argObject =  args.getJSONObject(0);

            if (argObject != null) {
                final AIRequest request = new AIRequest();

                if (argObject.has("query")) {
                    request.setQuery(argObject.getString("query"));
                }
                else {
                    callbackContext.error("Argument query must not be empty");
                }

                if (argObject.has("contexts")) {
                    final List<AIContext> contexts = new ArrayList<AIContext>();
                    final JSONArray arr = argObject.getJSONArray("contexts");
                    for (int i = 0; i < arr.length(); i++) {
                        final AIContext aiContext = new AIContext(arr.getString(i));
                        contexts.add(aiContext);
                    }

                    request.setContexts(contexts);
                }

                if (argObject.has("resetContexts")) {
                    request.setResetContexts(argObject.getBoolean("resetContexts"));
                }

                this.textRequest(request, callbackContext);
            }
            else{
                callbackContext.error("Arguments is empty");
            }
            
            return true;
        } else if (action.equals("requestVoice")) {

            JSONObject argObject =  args.getJSONObject(0);

            if (argObject != null) {

                if (argObject.has("contexts")) {
                    final List<AIContext> contexts = new ArrayList<AIContext>();
                    final JSONArray arr = argObject.getJSONArray("contexts");
                    for (int i = 0; i < arr.length(); i++) {
                        final AIContext aiContext = new AIContext(arr.getString(i));
                        contexts.add(aiContext);
                    }

                    this.requestVoice(contexts, callbackContext);
                }
                else {
                    this.requestVoice(null, callbackContext);    
                }
                
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
        }
        return false;
    }

    public void init(String baseUrl, String clientAccessToken, String subscriptionKey, CallbackContext callbackContext) {
        
        try{
            final AIConfiguration config = new AIConfiguration(clientAccessToken,
                    subscriptionKey, AIConfiguration.SupportedLanguages.English,
                    AIConfiguration.RecognitionEngine.Speaktoit);
            aiService = AIService.getService(this.cordova.getActivity().getApplicationContext(), config);
            aiService.setListener(this);

            callbackContext.success();
        }
        catch(Exception ex){
            callbackContext.error(ex.getMessage());
        }
    }

    public void textRequest(final AIRequest request, CallbackContext callbackContext){
        try{
            final AIResponse response = aiService.textRequest(request);
            final String jsonResponse = gson.toJson(response);
            callbackContext.success(jsonResponse);
        }
        catch(Exception ex){
            callbackContext.error(ex.getMessage());
        }
    }

    public void requestVoice(List<AIContext> contexts, final CallbackContext callbackContext){
        try{
           currentCallbacks = callbackContext;
           aiService.startListening(contexts);
        }
        catch(Exception ex){
            callbackContext.error(ex.getMessage());
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
            callbackContext.error(ex.getMessage());
        }
    }

    public void cancelAllRequests(CallbackContext callbackContext){
        try{
           aiService.cancel();
           callbackContext.success();
        }
        catch(Exception ex){
            callbackContext.error(ex.getMessage());
        }
    }

    public void setLevelMeterCallback(final CallbackContext callbacks){
        levelMeterCallback = callbacks;
    }

    @Override
    public void onReset() {
        try{
           aiService.cancel();
        }
        catch(Exception ex){
            ex.printStackTrace();
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
            final String jsonResponse = gson.toJson(response);
            currentCallbacks.success(jsonResponse);
            currentCallbacks = null;
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
        if (levelMeterCallback != null) {
            final PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, (int)level);
            pluginResult.setKeepCallback(true);
            levelMeterCallback.sendPluginResult(pluginResult);
        }
    }

    @Override
    public void onListeningStarted() {
        
    }

    @Override
    public void onListeningFinished() {
        
    }

}
