//
//  ApiAIPlugin.h
//  ApiAIPhoneGapSDK
//
//  Created by Kuragin Dmitriy on 27/10/14.
//
//

#import <Cordova/CDV.h>

@interface ApiAIPlugin : CDVPlugin

- (void)init:(CDVInvokedUrlCommand*)command;

- (void)requestText:(CDVInvokedUrlCommand*)command;
- (void)requestVoice:(CDVInvokedUrlCommand*)command;

- (void)cancelAllRequests:(CDVInvokedUrlCommand*)command;

@end
