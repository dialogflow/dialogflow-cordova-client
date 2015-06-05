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

exports.defineAutoTests = function() {
	describe('ApiAIPlugin', function () {

		var lang;
		var subscriptionKey;
		var accessToken;

		beforeEach(function() {
			this.lang = "en";
			this.subscriptionKey = "cb9693af-85ce-4fbf-844a-5563722fc27f";
			this.accessToken = "3485a96fb27744db83e78b8c4bc9e7b7";
		});	

		it("should exist", function() {
	      expect(ApiAIPlugin).toBeDefined();
	    });

		it("should not throw exception", function() {
			var func = function(){
		    	ApiAIPlugin.init({
			                         subscriptionKey: "cb9693af-85ce-4fbf-844a-5563722fc27f",
 			                         clientAccessToken: "3485a96fb27744db83e78b8c4bc9e7b7",
 			                         lang: "en",
			                         baseURL: "https://api.api.ai/api/",
			                         version: "20150204"
		                         },
		                         function () {
	                            	
		                         },
		                         function (error) {
		                            
		                         });
			};

			expect(func).not.toThrow();
		});

	    it("should init success", function (done) {
	    	var initSuccess;
	    	ApiAIPlugin.init({
		                         subscriptionKey: "cb9693af-85ce-4fbf-844a-5563722fc27f",
		                         clientAccessToken: "3485a96fb27744db83e78b8c4bc9e7b7",
		                         lang: "en",
		                         baseURL: "https://api.api.ai/api/",
		                         version: "20150204"
	                         },
	                         function () {
                            	initSuccess = true;
	    						expect(initSuccess).toBe(true);
                            	done();
	                         },
	                         function (error) {
	                            initSuccess = false;
	    						expect(initSuccess).toBe(true);
	                            done();
	                         });

	    });
	});
};



