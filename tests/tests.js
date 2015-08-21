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

exports.defineAutoTests = function() {
	describe('init function', function () {

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

	    it("should success", function (done) {
	    	var initSuccess;
	    	ApiAIPlugin.init({
		                         subscriptionKey: "cb9693af-85ce-4fbf-844a-5563722fc27f",
		                         clientAccessToken: "3485a96fb27744db83e78b8c4bc9e7b7",
		                         lang: "en",
		                         baseURL: "https://api.api.ai/api/"
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

	describe('requestText function', function () {

		var lang;
		var subscriptionKey;
		var accessToken;

		beforeEach(function (done) {
			lang = "en";
			subscriptionKey = "cb9693af-85ce-4fbf-844a-5563722fc27f";
			accessToken = "3485a96fb27744db83e78b8c4bc9e7b7";

	    	ApiAIPromises.init({
				subscriptionKey: subscriptionKey,
				clientAccessToken: accessToken,
				lang: lang,
				baseURL: "https://api.api.ai/api/"
            })
	    	.then(function () {
            	done();
            })
	    	.fail(function (error) {
	    		console.log(error);
            	done();
            });
		});	

		it("should return response", function (done) {
			ApiAIPromises.requestText(
			{
				query: "Hello"
			})
			.then(function (response) {
			    expect(response).not.toBe(null);
			    expect(response.result.resolvedQuery).toEqual("Hello");
			    expect(response.result.action).toEqual("greeting");
			    expect(response.result.fulfillment.speech).toEqual("Hi! How are you?");
			    done();
			})
			.fail(function (error) {
				fail(error)
			    done();
			});
		});

		it("should use input contexts", function (done) {
			
			ApiAIPromises.requestText(
			{
				query: "Hello"
			})
			.then(function (response) {
				expect(response.result.action).toEqual("greeting");

				return ApiAIPromises.requestText(
				{
					query: "Hello",
					contexts: [ "firstContext" ],
					resetContexts: true
				});
			})
			.then(function (response) {
				expect(response.result.action).toEqual("firstGreeting");

				return ApiAIPromises.requestText(
				{
					query: "Hello",
					contexts: [ "secondContext" ],
					resetContexts: true
				});
			})
			.then(function (response) {
				expect(response.result.action).toEqual("secondGreeting");
			})
			.fail(function (error) {
				fail(error);
			})
			.fin(function () {
				done();
			});
		});

		it("should return output contexts", function (done) {

			ApiAIPromises.requestText(
			{
				query: "weather"
			})
			.then(function (response) {
				expect(response.result.action).toEqual("showWeather");
				expect(response.result.contexts).not.toBe(null);
				expect(response.result.contexts.some(function(e) { return e.name == "weather"; })).toBe(true);
			})
			.fail(function (error) {
				fail(error);
			})
			.fin(function () {
				done();
			});
		});

		it("should recieve parameters", function (done) {

			ApiAIPromises.requestText(
			{
				query: "what is your name"
			})
			.then(function (response) {
				expect(response.result.parameters).toBeDefined();
				expect(response.result.parameters).not.toBe(null);
				expect(response.result.parameters.my_name).toEqual("Sam");
				expect(response.result.parameters.param).toEqual("blabla");

				expect(response.result.contexts).toBeDefined();
				expect(response.result.contexts).not.toBe(null);
				
				var outputContext = response.result.contexts[0];
				expect(outputContext.name).toEqual("name_question");
				expect(outputContext.parameters.my_name).toEqual("Sam");
				expect(outputContext.parameters.param).toEqual("blabla");

			})
			.fail(function (error) {
				fail(error);
			})
			.fin(function () {
				done();
			});
		});

		it("should use custom entities", function (done) {
			ApiAIPromises.requestText(
			{
				query: "hi nori",
				entities: [
				  {
				    name: "dwarfs",
				    entries: [
				      {
				        value: "Ori",
				        synonyms: [
				          "ori",
				          "Nori"
				        ]
				      },
				      {
				        value: "bifur",
				        synonyms: [
				          "Bofur",
				          "Bombur"
				        ]
				      }
				    ]
				  }
				]
			})
			.then(function (response) {
				expect(response.result.action).toEqual("say_hi");
				expect(response.result.fulfillment.speech).toEqual("hi Bilbo, I am Ori");
			})
			.fail(function (error) {
				fail(error);
			})
			.fin(function () {
				done();
			});
		});

		it("should fail if wrong entities specified", function (done) {
			
			ApiAIPromises.requestText(
			{
				query: "hi Bofur",
				entities: [
				  {
				    name: "not_dwarfs",
				    entries: [
				      {
				        value: "Ori",
				        synonyms: [
				          "ori",
				          "Nori"
				        ]
				      },
				      {
				        value: "bifur",
				        synonyms: [
				          "Bofur",
				          "Bombur"
				        ]
				      }
				    ]
				  }
				]
			})
			.then(function (response) {
				fail("request should fail");
			})
			.fail(function (error) {
				expect(true).toBe(true);
			})
			.fin(function () {
				done();
			});
		});

	});

	xdescribe("requestVoice function", function () {

		beforeEach(function (done) {
			var lang = "en";
			var subscriptionKey = "cb9693af-85ce-4fbf-844a-5563722fc27f";
			var accessToken = "3485a96fb27744db83e78b8c4bc9e7b7";

			ApiAIPromises.init({
				subscriptionKey: subscriptionKey,
				clientAccessToken: accessToken,
				lang: lang,
				baseURL: "https://api.api.ai/api/"
		    })
			.then(function () {
		    	done();
		    })
			.fail(function (error) {
				console.log(error);
		    	done();
		    });
		});

		it("shoud call listeningStrarted", function (done) {

			var called = false;
			ApiAIPromises.setListeningStartCallback(function () {
				called = true;
				ApiAIPromises.stopListening();
			});

			ApiAIPromises.requestVoice()
			.then(function (response) {
				expect(called).toBe(true);
			})
			.fail(function (error) {
				// after stop listening will be thrown "no speech input"
				expect(called).toBe(true);
			})
			.fin(function () {
				done();
			});
		});

	});

};



