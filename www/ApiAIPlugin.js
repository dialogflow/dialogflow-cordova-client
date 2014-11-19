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

var cordova = require('cordova'),
exec = require('cordova/exec');

var ApiAIPlugin = function() {
        this.options = {};
};

ApiAIPlugin.prototype = {
             init:function(baseURL, clientAccessToken, subscriptionKey) {
                 cordova.exec(
                     null, 
                     null,
                     "ApiAIPlugin",
                     "init",
                     [baseURL, clientAccessToken, subscriptionKey]
                     );
             },
            
            requestText: function(callback, errCallbac, options) {
                    cordova.exec(callback,
                                 errCallbac,
                                 "ApiAIPlugin",
                                 "requestText",
                                 [options]);
            },
    
            requestVoice: function (callback, errCallbac, options) {
                    cordova.exec(callback,
                                 errCallbac,
                                 "ApiAIPlugin",
                                 "requestVoice",
                                 [options]);
            },
             levelMeterCallback: function (callback) {
                 cordova.exec(callback,
                              null,
                              "ApiAIPlugin",
                              "levelMeterCallback",
                              []);
             },
            
            cancelAllRequests: function () {
                cordova.exec(callback,
                             errCallbac,
                             "ApiAIPlugin",
                             "cancelAllRequests",
                             []);
            }

};

var ApiAIPlugin = new ApiAIPlugin();

module.exports = ApiAIPlugin;