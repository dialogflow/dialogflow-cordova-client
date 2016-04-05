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

"use strict";

var cordova = require('cordova');

var ApiAIPluginProto = function() {

};

ApiAIPluginProto.prototype = {
    init: function(options, success, error) {

        if (!options) {
            throw new Error("options must not be null");
        }

        if (!options.clientAccessToken) {
            throw new Error("clientAccessToken must not be empty");
        }

        if (!options.baseURL){
            options.baseURL = "https://api.api.ai/v1/";
        }

        if (!options.version) {
            options.version = "20150910";
        }

        success = success || null;
        error = error || null;

        cordova.exec(
             success, 
             error,
             "ApiAIPlugin",
             "init",
             [options]
             );
    },

    requestText: function(options, success, error) {

        if (!options) {
            throw new Error("options must not be null");
        }

        success = success || null;
        error = error || null;

        cordova.exec(success,
                     error,
                     "ApiAIPlugin",
                     "requestText",
                     [options]);
    },

    requestVoice: function (options, success, error) {
        
        options = options || {};
        success = success || null;
        error = error || null;

        cordova.exec(success,
                     error,
                     "ApiAIPlugin",
                     "requestVoice",
                     [options]);
    },

    setListeningStartCallback: function (callback) {
        cordova.exec(callback,
                      null,
                      "ApiAIPlugin",
                      "listeningStartCallback",
                      []);
     },

     setListeningFinishCallback: function (callback) {
         cordova.exec(callback,
                       null,
                       "ApiAIPlugin",
                       "listeningFinishCallback",
                       []);
      },

    setPartialResultsCallback: function (callback) {
        cordova.exec(callback,
            null,
            "ApiAIPlugin",
            "partialResultsCallback",
            []);
    },

    levelMeterCallback: function (callback) {
        cordova.exec(callback,
                      null,
                      "ApiAIPlugin",
                      "levelMeterCallback",
                      []);
     },

    cancelAllRequests: function () {
        cordova.exec(null,
                     null,
                     "ApiAIPlugin",
                     "cancelAllRequests",
                     []);
    },
               
    stopListening: function () {
        cordova.exec(null,
                     null,
                     "ApiAIPlugin",
                     "stopListening",
                     []);
   }

};


var ApiAIPlugin = new ApiAIPluginProto();
module.exports = ApiAIPlugin;