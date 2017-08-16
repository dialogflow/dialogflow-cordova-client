(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);

  module.controller('AppController', function($scope, $data) {
    $scope.doSomething = function() {
      setTimeout(function() {
        alert('tappaed');
      }, 100);
    };
  });
 
  module.controller('SettingsController', function($scope, $settings) {
    $scope.languages = $settings.languages;
    $scope.selectedLanguage = $settings.selectedLanguage;
                    
    $scope.clickLanguage = function(index) {
        $scope.selectedLanguage = $settings.languages[index];
        Storage.getInstance().setSelectedLanguage($settings.languages[index]);
    }
  });
 
 module.controller('TextRequestController', function($scope, $data) {
                   
                   });

  module.controller('MasterController', function($scope, $data) {
    $scope.items = $data.items;  
    
    $scope.showDetail = function(index) {
        switch (index)
        {
            case 0: {
                $scope.ons.navigator.pushPage('TextRequest.html', {});
                break;
            }
            case 1: {
                $scope.ons.navigator.pushPage('Settings.html', {});
                break;
            }
        }
    };
  });

  module.factory('$data', function() {
      var data = {};
      
      data.items = [
          { 
              title: 'Text Request',
          },
          { 
              title: 'Settings',
          }
      ]; 
      
      return data;
  });
 
 module.factory('$settings', function() {
                    var data = {};
                    
                    storage = Storage.getInstance();
                    
                    data.languages = storage.getLanguages();
                    
                    data.selectedLanguage = storage.getSelectedLanguage();
                    
                    return data;
                });
})();

