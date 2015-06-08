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

var Q = require('ai.api.apiaiplugin.Q');
var ApiAIPlugin = require('ai.api.apiaiplugin.ApiAIPlugin');

var ApiAIPromises = function() {
        this.options = {};
};

ApiAIPromises.prototype = {
    init: function(options) {
        var deferred = Q.defer();

        ApiAIPlugin.init(options, 
            function () {
                deferred.resolve();
             }, 
             function (error) {
                deferred.reject(new Error(error));
             });

        return deferred.promise;
    },

    requestText: function(options) {

        var deferred = Q.defer();

        ApiAIPlugin.requestText(options, 
            function (response) {
                deferred.resolve(response);
             }, 
             function (error) {
                deferred.reject(new Error(error));
             });

        return deferred.promise;
    },

    requestVoice: function (options) {
        var deferred = Q.defer();

        ApiAIPlugin.requestText(options, 
            function (response) {
                deferred.resolve(response);
             }, 
             function (error) {
                deferred.reject(new Error(error));
             });

        return deferred.promise;
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

var ApiAIPromises = new ApiAIPromises();
module.exports = ApiAIPromises;