'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];

    $http.get('/api/tokyometro/trains/delayed').success(function(trains) {
      $scope.trains = trains;
    });
  });
