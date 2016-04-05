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
 			                         clientAccessToken: "3485a96fb27744db83e78b8c4bc9e7b7",
 			                         lang: "en"
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
		                         clientAccessToken: "3485a96fb27744db83e78b8c4bc9e7b7",
		                         lang: "en"
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
		var accessToken;

		beforeEach(function (done) {
			lang = "en";
			accessToken = "3485a96fb27744db83e78b8c4bc9e7b7";

	    	ApiAIPromises.init({
				clientAccessToken: accessToken,
				lang: lang
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
				fail(error);
			    done();
			});
		});

		it("should use input contexts", function (done) {
			
			ApiAIPromises.requestText(
			{
				query: "Hello",
				resetContexts: true
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

		it("should receive parameters", function (done) {

			ApiAIPromises.requestText(
			{
				query: "what is your name",
				resetContexts: true
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

		it("should not fail if empty entities list specified", function (done) {
			ApiAIPromises.requestText(
				{
					query: "hi bofur",
					entities: []
				}
			)
			.then(function (response) {
                expect(true).toBe(true);

			})
			.fail(function(error) {
                fail("request fail");
			})
			.fin(function () {
				done();
			});
		});

        it("should use parameters in input context", function (done) {
            ApiAIPromises.requestText(
                {
                    query: "and for tomorrow",
                    contexts: [
                        {
                            name: "weather",
                            parameters: {
                                location: "London"
                            }
                        }
                    ]
                }
            )
            .then(function(response){
                expect(response.result.fulfillment.speech).toEqual("Weather in London for tomorrow");
            })
            .fail(function(error){
                fail(error);
            })
            .fin(function(){
               done();
            });
        });

        it("should support lifespan option", function(done) {
            ApiAIPromises.requestText(
                {
                    query: "weather in london",
					resetContexts: true
                }
            )
            .then(function(response){
                expect(response.result.contexts).toBeDefined();
                expect(response.result.contexts).not.toBe(null);

                var c1 = response.result.contexts.filter(function(c){
                    return c.name == "weather";
                })[0];
                expect(c1).not.toBe(null);
                expect(c1.lifespan).toEqual(5);

                var c2 = response.result.contexts.filter(function(c){
                    return c.name == "shortcontext";
                })[0];
                expect(c2).not.toBe(null);
                expect(c2.lifespan).toEqual(2);

                var c3 = response.result.contexts.filter(function(c){
                    return c.name == "longcontext";
                })[0];
                expect(c3).not.toBe(null);
                expect(c3.lifespan).toEqual(10);

            })
            .fail(function(error){
                fail(error);
            })
            .fin(function(){
                done();
            });
        });

        it("should support lifespan in input context", function(done) {
            ApiAIPromises.requestText(
                {
                    query: "and for tomorrow",
					resetContexts: true,
                    contexts: [
                        {
                            name: "weather",
                            lifespan: 3,
                            parameters: {
                                location: "London"
                            }
                        }
                    ]
                }
            ).then(function(response){

                expect(response.result.fulfillment.speech).toEqual("Weather in London for tomorrow");

                expect(response.result.contexts).toBeDefined();
                expect(response.result.contexts).not.toBe(null);

                var c1 = response.result.contexts.filter(function(c) {
                    return c.name == "weather";
                })[0];
                expect(c1).not.toBe(null);
                expect(c1.lifespan).toEqual(2);

                return ApiAIPromises.requestText({
                    query: "next request"
                });
            })
            .then(function(response){

                var c1 = response.result.contexts.filter(function(c) {
                    return c.name == "weather";
                })[0];
                expect(c1).not.toBe(null);
                expect(c1.lifespan).toEqual(1);

                return ApiAIPromises.requestText({
                    query: "next request"
                });
            })
            .then(function(response){
                var c1 = response.result.contexts.filter(function(c) {
                    return c.name == "weather";
                })[0];
                expect(c1).not.toBe(null);
                expect(c1.lifespan).toEqual(0);

                return ApiAIPromises.requestText({
                    query: "next request"
                });
            })
            .then(function(response) {
                var results = response.result.contexts.filter(function(c) {
                    return c.name == "weather";
                });
                expect(results.length).toEqual(0);
            })
            .fail(function(error){
                fail(error);
            })
            .fin(function(){
                done();
            });
        });

	});

	xdescribe("requestVoice function", function () {

		beforeEach(function (done) {
			var lang = "en";
			var accessToken = "3485a96fb27744db83e78b8c4bc9e7b7";

			ApiAIPromises.init({
				clientAccessToken: accessToken,
				lang: lang
		    })
			.then(function () {
		    	done();
		    })
			.fail(function (error) {
				console.log(error);
		    	done();
		    });
		});

		it("should call listeningStrarted", function (done) {

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



