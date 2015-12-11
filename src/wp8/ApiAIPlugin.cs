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

namespace Cordova.Extension.Commands
{
    public class ApiAIPlugin : BaseCommand
    {
        public void echo(string options)
        {
            // all JS callable plugin methods MUST have this signature!
            // public, returning void, 1 argument that is a string

            string optVal = null;

            try
            {
                optVal = JsonHelper.Deserialize<string[]>(options)[0];
            }
            catch(Exception)
            {
                // simply catch the exception, we handle null values and exceptions together
            }

            if (optVal == null)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
            }
            else
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "{result:\"some result\"}"));
            }
        }



        public override void OnPause(object sender, DeactivatedEventArgs e) {

        }

        public virtual void OnResume(object sender, ActivatedEventArgs e) {

        }
    }
}

