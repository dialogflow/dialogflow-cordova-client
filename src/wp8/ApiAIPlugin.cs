/***********************************************************************************************************************
 *
 * API.AI Cordova SDK
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

using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.Cordova.JSON;
using Microsoft.Phone.Shell;
using JSON;
using System.Collections.Generic;
using ApiAiSDK;
using ApiAiSDK.Model;


namespace Cordova.Extension.Commands
{
    public class ApiAIPlugin : BaseCommand
    {
        private AIService aiService;

        public async void init(string options)
        {
            try
            {
                var optionsMap = JsonHelper.Deserialize<Dictionary<string,string>>(options);

                var subscriptionKey = optionsMap["subscriptionKey"];
                var accessToken = optionsMap["clientAccessToken"];

                var config = new AIConfiguration(subscriptionKey,
                                                 accessToken,
                                                 SupportedLanguage.English);

                aiService = AIService.CreateService(config);

                aiService.OnResult += aiService_OnResult;
                aiService.OnError += aiService_OnError;

                await aiService.InitializeAsync();

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }

        }

        private void aiService_OnError(AIServiceException error)
        {
            Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                // sample error processing

            });
        }

        private void aiService_OnResult(ApiAiSDK.Model.AIResponse response)
        {
            Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                // sample result processing

            });
        }

        public void requestText(string options)
        {
            try
            {
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }

            var optionsArray = JSON.JsonHelper.Deserialize<string[]>(options);

            PluginResult result;

            result = new PluginResult(PluginResult.Status.OK, upperCase);

            DispatchCommandResult(result);
        }

        public void requestVoice(string options)
        {
            try
            {
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        public void listeningStartCallback(string options)
        {
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
        }

        public void listeningFinishCallback(string options)
        {
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
        }

        public void partialResultsCallback(string options)
        {
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
        }

        public void recognitionResultsCallback(string options)
        {
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
        }

        public void levelMeterCallback(string options)
        {
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
        }

        public void cancelAllRequests(string options)
        {
            try
            {
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        public void stopListening(string options)
        {
            try
            {
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        public override void OnPause(object sender, DeactivatedEventArgs e) {

        }

        public virtual void OnResume(object sender, ActivatedEventArgs e) {

        }
    }
}

