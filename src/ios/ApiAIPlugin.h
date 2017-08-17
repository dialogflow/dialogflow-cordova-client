/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <Cordova/CDV.h>

@interface ApiAIPlugin : CDVPlugin

- (void)init:(CDVInvokedUrlCommand*)command;

- (void)requestText:(CDVInvokedUrlCommand*)command;
- (void)requestVoice:(CDVInvokedUrlCommand*)command;

- (void)cancelAllRequests:(CDVInvokedUrlCommand*)command;

- (void)stopListening:(CDVInvokedUrlCommand*)command;

- (void)levelMeterCallback:(CDVInvokedUrlCommand*)command;

- (void)setListeningFinishCallback:(CDVInvokedUrlCommand*)command;
- (void)setListeningStartCallback:(CDVInvokedUrlCommand*)command;

@end
