//
//  ApiAIPlugin.m
//  ApiAIPhoneGapSDK
//
//  Created by Kuragin Dmitriy on 27/10/14.
//
//

#import "ApiAIPlugin.h"
#import "ApiAI.h"
#import "AITextRequest.h"
#import "AIVoiceRequest.h"

#import <AVFoundation/AVFoundation.h>

@interface CustomConfiguration : NSObject <AIConfiguration>

@property(nonatomic, copy) NSURL *baseURL;
@property(nonatomic, copy) NSString *clientAccessToken;
@property(nonatomic, copy) NSString *subscriptionKey;

@end

@implementation CustomConfiguration

@end


@interface ApiAIPlugin ()

@property(nonatomic, strong) ApiAI *api;

@property(nonatomic, strong) CDVInvokedUrlCommand *levelMeterCommand;

@end

@implementation ApiAIPlugin

- (void)init:(CDVInvokedUrlCommand*)command
{
    [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord
                                     withOptions:AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionDefaultToSpeaker
                                           error:nil];
    [[AVAudioSession sharedInstance] setActive:YES
                                   withOptions:AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionDefaultToSpeaker
                                         error:nil];
    
    ApiAI *api = [[ApiAI alloc] init];
    
    id <AIConfiguration> configuration = [[CustomConfiguration alloc] init];
    
    configuration.baseURL = [NSURL URLWithString:command.arguments[0]];
    configuration.clientAccessToken = command.arguments[1];
    configuration.subscriptionKey = command.arguments[2];
    
    api.configuration = configuration;
    
    self.api = api;
}

- (void)requestText:(CDVInvokedUrlCommand*)command
{
    AITextRequest *textRequest = (AITextRequest *)[_api requestWithType:AIRequestTypeText];
    
    NSDictionary *options = [command.arguments lastObject];
    
    textRequest.query = options[@"query"];
    
    if (options[@"lang"]) {
        textRequest.lang = options[@"lang"];
    }
    
    if (options[@"contexts"]) {
        textRequest.contexts = options[@"contexts"];
    }
    
    if (options[@"resetContexts"]) {
        textRequest.resetContexts = [options[@"resetContexts"] boolValue];
    }
    
    [textRequest setCompletionBlockSuccess:^(AIRequest *request, id response) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    } failure:^(AIRequest *request, NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:[error localizedDescription]];
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    }];
    
    [_api enqueue:textRequest];
}

- (void)requestVoice:(CDVInvokedUrlCommand*)command
{
    AIVoiceRequest *voiceRequest = (AIVoiceRequest *)[_api requestWithType:AIRequestTypeVoice];
    
    NSDictionary *options = [command.arguments lastObject];
    
    if (options[@"lang"]) {
        voiceRequest.lang = options[@"lang"];
    }
    
    if (options[@"contexts"]) {
        voiceRequest.contexts = options[@"contexts"];
    }
    
    if (options[@"resetContexts"]) {
        voiceRequest.resetContexts = [options[@"resetContexts"] boolValue];
    }
    
    if (options[@"useVAD"]) {
        voiceRequest.useVADForAutoCommit = [options[@"useVAD"] boolValue];
    }
    
    [voiceRequest setCompletionBlockSuccess:^(AIRequest *request, id response) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    } failure:^(AIRequest *request, NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:[error localizedDescription]];
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    }];
    
    [voiceRequest setSoundLevelHandleBlock:^(AIRequest *request, float level){
        if (self.levelMeterCommand) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:(double)level];
            result.keepCallback = @(YES);
            [self.commandDelegate sendPluginResult:result
                                        callbackId:self.levelMeterCommand.callbackId];
        }
    }];
    
    [_api enqueue:voiceRequest];
}

- (void)levelMeterCallback:(CDVInvokedUrlCommand*)command
{
    self.levelMeterCommand = command;
}

- (void)cancelAllRequests:(CDVInvokedUrlCommand*)command
{
    [_api cancellAllRequests];
}

@end
