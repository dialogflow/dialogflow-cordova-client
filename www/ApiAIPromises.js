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

var Q = require('cordova-plugin-apiai.Q');
var ApiAIPlugin = require('cordova-plugin-apiai.ApiAIPlugin');

var ApiAIPromisesProto = function() {

};

ApiAIPromisesProto.prototype = {
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

        ApiAIPlugin.requestVoice(options, 
            function (response) {
                deferred.resolve(response);
             }, 
             function (error) {
                deferred.reject(new Error(error));
             });

        return deferred.promise;
    },

    setListeningStartCallback: function (callback) {
        ApiAIPlugin.setListeningStartCallback(callback);
     },

     setListeningFinishCallback: function (callback) {
         ApiAIPlugin.setListeningFinishCallback(callback);
      },

    levelMeterCallback: function (callback) {
        ApiAIPlugin.levelMeterCallback(callback);
     },

    cancelAllRequests: function () {
        ApiAIPlugin.cancelAllRequests();
    },
               
    stopListening: function () {
        ApiAIPlugin.stopListening();
   }
};

var ApiAIPromises = new ApiAIPromisesProto();
module.exports = ApiAIPromises;