//
//  ApiAIPlugin.m
//  ApiAIPhoneGapSDK
//
//  Created by Kuragin Dmitriy on 27/10/14.
//
//

#import "ApiAIPlugin.h"
#import <ApiAI/ApiAI.h>

#import <AVFoundation/AVFoundation.h>

@interface CustomConfiguration : NSObject <AIConfiguration>

@property(nonatomic, copy) NSURL *baseURL;
@property(nonatomic, copy) NSString *clientAccessToken;

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

- (void)deactivateAudioSession {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    
    [session setCategory:AVAudioSessionCategoryAmbient
             withOptions:0
                   error:nil];
    
    [session setActive:NO
           withOptions:0
                 error:nil];
}

- (void)activateAudioSession
{
    NSError *error = nil;
    
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord
             withOptions:(AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionDefaultToSpeaker)
                   error:&error];
    
    if (error) {
        NSLog(@"Error: %@", error.localizedDescription);
    }
    
    [session setActive:YES
           withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
                 error:&error];
    
    if (error) {
        NSLog(@"Error: %@", error.localizedDescription);
    }
}

- (void)init:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
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
    }];
}

- (NSArray *)mapContextsFromOptions:(NSDictionary *)options
{
    NSArray *contexts = options[@"contexts"];
    
    if (contexts && [contexts count] > 0) {
        
        NSMutableArray *requestContexts = [NSMutableArray array];
        
        [contexts enumerateObjectsUsingBlock:^(id  __AI_NONNULL obj, NSUInteger idx, BOOL * __AI_NONNULL stop) {
            
            if ([obj isKindOfClass:[NSString class]]) {
                AIRequestContext *context = [[AIRequestContext alloc] initWithName:obj
                                                                       andLifespan:nil
                                                                     andParameters:nil];
                [requestContexts addObject:context];
            } else {
                AIRequestContext *context = [[AIRequestContext alloc] initWithName:obj[@"name"]
                                                                       andLifespan:obj[@"lifespan"]
                                                                     andParameters:obj[@"parameters"]];
                [requestContexts addObject:context];
            }
        }];
        
        return [requestContexts copy];
    }
    
    return @[];
}

- (void)requestText:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        AITextRequest *textRequest = [_api textRequest];
        
        NSDictionary *options = [command.arguments lastObject];
        
        textRequest.query = options[@"query"];
        
        if (options[@"lang"]) {
            textRequest.lang = options[@"lang"];
        }
        
        textRequest.requestContexts = [self mapContextsFromOptions:options];
        
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
    }];
}

- (void)partialResultsCallback:(CDVInvokedUrlCommand*)command
{
    NSLog(@"WARNING: setPartialResultsCallback method was not implemented for iOS. Ignoring...");
}

- (void)requestVoice:(CDVInvokedUrlCommand*)command
{
    [self activateAudioSession];
    
    [self.commandDelegate runInBackground:^{
        AIVoiceRequest *voiceRequest = [_api voiceRequest];
        
        NSDictionary *options = [command.arguments lastObject];
        
        if (options[@"lang"]) {
            voiceRequest.lang = options[@"lang"];
        }
        
        voiceRequest.requestContexts = [self mapContextsFromOptions:options];
        
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
            [self deactivateAudioSession];
            
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
            self.lastVoiceRequest = nil;
            
            [self.commandDelegate sendPluginResult:result
                                        callbackId:command.callbackId];
        } failure:^(AIRequest *request, NSError *error) {
            [self deactivateAudioSession];
            
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
    }];
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
    [self.commandDelegate runInBackground:^{
        [_api cancellAllRequests];
    }];
}

- (void)stopListening:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        [self.lastVoiceRequest commitVoice];
    }];
}

@end
