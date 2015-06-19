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

@property(nonatomic, strong) CDVInvokedUrlCommand *listeningStartCallback;
@property(nonatomic, strong) CDVInvokedUrlCommand *listeningFinishCallback;

@property(nonatomic, strong) AIVoiceRequest *lastVoiceRequest;

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
    
    NSDictionary *parameters = [command.arguments firstObject];
    
    NSString *baseURL = parameters[@"baseURL"];
    if (baseURL) {
        configuration.baseURL = [NSURL URLWithString:baseURL];
    }
    
    NSString *clientAccessToken = parameters[@"clientAccessToken"];
    if (clientAccessToken) {
        configuration.clientAccessToken = clientAccessToken;
    }
    
    NSString *subscriptionKey = parameters[@"subscriptionKey"];
    if (subscriptionKey) {
        configuration.subscriptionKey = subscriptionKey;
    }
    
    NSString *lang = parameters[@"lang"];
    if (lang) {
        api.lang = lang;
    }
    
    NSString *version = parameters[@"version"];
    if (version && [version length]) {
        api.version = version;
    }
    
    api.configuration = configuration;
    
    self.api = api;
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
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
    
    if (options[@"entities"]) {
        textRequest.entities = [self userEntitiesFromArray:options[@"entities"]];
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
    
    if (options[@"entities"]) {
        voiceRequest.entities = [self userEntitiesFromArray:options[@"entities"]];
    }
    
    [voiceRequest setCompletionBlockSuccess:^(AIRequest *request, id response) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
        self.lastVoiceRequest = nil;
        
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    } failure:^(AIRequest *request, NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:[error localizedDescription]];
        self.lastVoiceRequest = nil;
        
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
        
    }];
    
    [voiceRequest setSoundRecordBeginBlock:^(AIRequest *request){
        if (self.listeningStartCallback) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            result.keepCallback = @(YES);
            [self.commandDelegate sendPluginResult:result
                                        callbackId:self.listeningStartCallback.callbackId];
        }
    }];
    
    [voiceRequest setSoundRecordEndBlock:^(AIRequest *request){
        if (self.listeningFinishCallback) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            result.keepCallback = @(YES);
            [self.commandDelegate sendPluginResult:result
                                        callbackId:self.listeningFinishCallback.callbackId];
        }
    }];
    
    [voiceRequest setSoundLevelHandleBlock:^(AIRequest *request, float level){
        if (self.levelMeterCommand) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:(double)level];
            result.keepCallback = @(YES);
            [self.commandDelegate sendPluginResult:result
                                        callbackId:self.levelMeterCommand.callbackId];
        }
    }];
    
    self.lastVoiceRequest = voiceRequest;
    
    [_api enqueue:voiceRequest];
}

- (NSArray *)userEntitiesFromArray:(NSArray *)entities
{
    NSMutableArray *userEntities = [NSMutableArray array];
    
    [entities enumerateObjectsUsingBlock:^(NSDictionary *objEntity, NSUInteger idx, BOOL *stop) {
        NSMutableArray *entries = [NSMutableArray array];
        
        [objEntity[@"entries"] enumerateObjectsUsingBlock:^(NSDictionary *objEntry, NSUInteger idx, BOOL *stop) {
            AIRequestEntry *entry = [[AIRequestEntry alloc] initWithValue:objEntry[@"value"]
                                                              andSynonims:objEntry[@"synonyms"]];
            [entries addObject:entry];
        }];
        
        AIRequestEntity *entity = [[AIRequestEntity alloc] initWithName:objEntity[@"name"]
                                                             andEntries:entries];
        
        [userEntities addObject:entity];
    }];
    
    return userEntities;
}

- (void)listeningStartCallback:(CDVInvokedUrlCommand*)command
{
    self.listeningStartCallback = command;
}

- (void)listeningFinishCallback:(CDVInvokedUrlCommand*)command
{
    self.listeningFinishCallback = command;
}

- (void)levelMeterCallback:(CDVInvokedUrlCommand*)command
{
    self.levelMeterCommand = command;
}

- (void)cancelAllRequests:(CDVInvokedUrlCommand*)command
{
    [_api cancellAllRequests];
}

- (void)stopListening:(CDVInvokedUrlCommand*)command
{
    [self.lastVoiceRequest commitVoice];
}

@end
