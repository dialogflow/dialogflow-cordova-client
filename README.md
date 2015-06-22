api-ai-cordova
==============

[![Build Status](https://travis-ci.org/api-ai/api-ai-cordova.svg)](https://travis-ci.org/api-ai/api-ai-cordova)

Plugin makes it easy to integrate your Cordova application with [api.ai](http://api.ai) natural language processing service. This plugin supports Android and iOS mobile operation systems.

Project on Github [https://github.com/api-ai/api-ai-cordova](https://github.com/api-ai/api-ai-cordova)  
Page in Cordova Plugins Registry [http://plugins.cordova.io/#/package/ai.api.apiaiplugin](http://plugins.cordova.io/#/package/ai.api.apiaiplugin)  
Github issues [https://github.com/api-ai/api-ai-cordova/issues](https://github.com/api-ai/api-ai-cordova/issues)  
Demo application sources [https://github.com/api-ai/api-ai-cordova-sample](https://github.com/api-ai/api-ai-cordova-sample)  

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
    - [Request Options](#request-options)
* [Supported Languages](#supported-languages)
* [Promise-Based Wrapper](#promise-based-wrapper)


# Installation
* Make sure that [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) is installed
* Install api.ai plugin with Cordova CLI:
```shell
cordova plugin add ai.api.apiaiplugin
```

# Usage
Add to your **index.js** file (typically in **js** folder) in function **onDeviceReady** following code
```javascript
ApiAIPlugin.init(
        {
            subscriptionKey: "YOUR_SUBSCRIPTION_KEY", // insert your subscription key here
            clientAccessToken: "YOUR_CLIENT_ACCESS_TOKEN", // insert your client access key here
            lang: "ru" // set lang tag from list of supported languages
        }, 
        function(result) { /* success processing */ },
        function(error) { /* error processing */ }
    );
```

Add to your page with mic button function to make voice requests:
```javascript
function sendVoice() {
    try {     
      ApiAIPlugin.requestVoice(
        {}, // empty for simple requests, some optional parameters can be here
        function (response) {
            // place your result processing here
            alert(JSON.stringify(response));
        },
        function (error) {
            // place your error processing here
            alert(error);
        });                
    } catch (e) {
        alert(e);
    }
}
```

If you want to create voice level visualization use function ```levelMeterCallback``` to set callback for processing soundLevel:
```javascript
ApiAIPlugin.levelMeterCallback(function(level) {
   console.log(level);
   // add visualization code here
});
```

If you want to handle start and stop listening events, add appropriate handlers:
```javascript
ApiAIPlugin.setListeningStartCallback(function () {
    console.log("listening started");
});

ApiAIPlugin.setListeningFinishCallback(function () {
    console.log("listening stopped");
});
```

**Please note**, that handlers must be added before ```ApiAIPlugin.requestVoice``` call, like here:
```javascript
function sendVoice() {
    try {    

      // !!!
      ApiAIPlugin.levelMeterCallback(function(level) {
         console.log(level);
      }); 

      ApiAIPlugin.requestVoice(...
```

Then add call ```sendVoice``` function from your button's ```onclick```:
```html
<div onclick="sendVoice();">Mic</div>
```

If you want make text requests add the following code:
```javascript
function sendText(query_text) {
    try {
        ApiAIPlugin.requestText(
            {
                query: query_text
            },
            function (response) {
                // place your result processing here
                alert(JSON.stringify(response));
            },
            function (error) {
                // place your error processing here
                alert(error);
            });
    } catch (e) {
        alert(e);
    }
}
```

Also you can use function to cancel current api.ai request:
```javascript
ApiAIPlugin.cancelAllRequests();
```

# API
```javascript
// Initialize plugin
//  options - JSON object - `{
//                              subscriptionKey: "your_subscription_key",
//                              clientAccessToken: "your_access_token",
//                              lang: "one_of_supported_languages"
//                           }`
//  success - Function (optional) - callback for initialization success: function () {}
//  error - Function (optional) - callback for initialization error: function (error) {}
ApiAIPlugin.init(clientAccessToken, subscriptionKey, success, error)

// Start listening, then make voice request to api.ai service
//  options - JSON object - voice request options (reserved for future use)
//  success - Function (optional) - callback for request success `function (response) {}` where response is Object 
//  error - Function (optional) - callback for request error `function (error) {}` where error is String
ApiAIPlugin.requestVoice(options, success, error)

// Make text request to api.ai service
//  options - JSON object - `{ query: "queryText" }`
//  success - Function (optional) - callback for request success `function (response) {}` where response is Object 
//  error - Function (optional) - callback for request error `function (error) {}` where error is String
ApiAIPlugin.requestText(options, success, error)

// Set callback for sound level. Need to call only once after initialization
//  callback - Function - function must be `function(level) { }`, level is float value from 0 to 1
ApiAIPlugin.levelMeterCallback(callback)

// Cancel all pending requests
ApiAIPlugin.cancelAllRequests()

// Stop current listening process and send request to server
ApiAIPlugin.stopListening()

// Set callback for listening started event
//  callback - Function - must be simple function without arguments: function () {} 
ApiAIPlugin.setListeningStartCallback(callback)

// Set callback for listening finished callback
//  callback - Function - must be simple function without arguments: function () {}
ApiAIPlugin.setListeningFinishCallback(callback)
```

## Request Options
The `options` parameter may contains following fields:
* `query` - text query, only appliable to `requestText` function
* `contexts` - list of strings, input context for the request (See [Contexts Quick Start](http://api.ai/docs/getting-started/quick-start-contexts.html) for more information about Contexts)
    ```javascript
    contexts: [ "weather", "home" ]
    ```

* `resetContexts` - boolean flag, set it to true to reset current active contexts
    ```javascript
    resetContexts: true
    ```

* `entities` - array of entities that replace developer defined entities for this request only. The entity(ies) need to exist in the developer console. Each entity is the pair of name and `entries` array. Entries array contains one or more items with `value` and `synonyms` fields.
    ```javascript
    entities: [
      {
        name: "dwarfs",
        entries: [
          {
            value: "Ori",
            synonyms: [
              "Ori",
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
    ```

# Supported Languages
* en
* es
* ru
* de
* pt
* pt-BR
* es
* fr
* it
* ja
* ko
* zh-CN
* zh-HK
* zh-TW

# Promise-Based Wrapper
The promise-based wrapper was added for ease of use and better interoperability with other JavaScript code. Wrapper implemented using the [Q](https://github.com/kriskowal/q) library. You can use the wrapper through `ApiAIPromises` module. For example:
```javascript
ApiAIPromises.requestText(
{
    query: "Hello"
})
.then(function (response) {
    // some response processing
    console.log(response.result.action);
})
.fail(function (error) {
    // some error processing
    console.log(error);
});
```

More samples you can find in the [tests](https://github.com/api-ai/api-ai-cordova/blob/master/tests/tests.js) module.

