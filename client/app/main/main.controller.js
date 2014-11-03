'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function($scope, $http, $q) {

    // filter
    $scope.in30mins = function(input) {
      return parseInt(input.timeToCurrentStation) <= 30;
    };

    function requestJapaneseStationName(station) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/stations/' + station)
        .then(function(data) {
          if (data.data) {
            deferred.resolve(data.data[0]['dc:title']);
          } else {
            deferred.reject(null);
          }
        });
      return deferred.promise;
    }

    $http.get('/api/tokyometro/trains/delayed').success(function(trains) {
      $scope.trains = trains;
    });

    requestJapaneseStationName('odpt.Station:TokyoMetro.Tozai.Urayasu')
      .then(function(name) {
        $scope.currentStation = name;
      });
    $scope.endTime = 30;
    $scope.destination = '中野行';
    $scope.delayStatus = '平常運行';

    $scope.directions = [];

    $scope.nearbyTrainList = [];

    $http.get('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu').
    then(function(data) {
      var downDirection = data.data['odpt.Station:TokyoMetro.Tozai.NishiFunabashi'];
      _(downDirection).forEach(function(train) {
        var item = {
          fromStation: train['odpt:fromStation'],
          delay: train['odpt:delay'],
          delayStatus: train['odpt:delay'] !== 0 ? true : false,
          delayStatusCopy: train['odpt:delay'] === 0 ? '平常運行' : parseInt(train['odpt:delay']/60)+'分遅れ',
          trainNumber: train['odpt:trainNumber'],
          timeTable: '',
          trainType: train['odpt:trainType'] === 'odpt.TrainType:TokyoMetro.Local' ? '普通' : '快速',
          trainTypeCss: train['odpt:trainType'].indexOf('ocal') > -1 ? 'local' : 'rapid',
          timeToCurrentStation: '',
          barWidth: {
            'width': ''
          },
          dotPosition: {
            'transform': ''
          },
          dotRotate: 'rotate(300deg)',
          rotate: 30
        };
        requestDepatureTime(item.trainNumber)
          .then(function(time) {
            item.timeTable = time;
            var miriSec = (new Date((new Date()).toDateString() + ' ' + time) - new Date()) + item.delay;
            miriSec = miriSec > 0 ? miriSec : 0;
            var seconds = Math.floor((miriSec / 1000) % 60);
            var minutes = Math.floor(((miriSec / 1000) - seconds) / 60);
            item.timeToCurrentStation = minutes + ':' + seconds;

            var pers = miriSec / ($scope.endTime * 60 * 1000);
            item.barWidth = {
              'width': 30 + (1 - pers) * 60 + '%'
            };
            item.dotRotate = 'rotate(' + (360 * pers) + 'deg)';
            item.rotate = 360 * pers;
          });
        $scope.nearbyTrainList.push(item);
      });
    });

    $scope.railways = [];
    $http.get('/api/tokyometro/railways')
      .then(function(data) {
        $scope.railways = data.data;
      });

    $scope.showDestinationMenu = function(event) {
      if (!$scope.selectedStation) return;
      if ($scope.currentStationModel === $scope.selectedStation)
        return;
      $scope.currentStationModel = $scope.selectedStation;
      var station = $scope.currentStationModel["odpt:station"];
      $http.get('/api/tokyometro/stations/raildirection/' + station)
        .then(function(data) {
          $scope.directions = data.data;
        });
    };

    function requestDepatureTime(trainNum) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/trains/timetable/' + trainNum)
        .then(function(data) {
          var timetables = data.data;
          var table = timetables['odpt:holidays'] ? timetables['odpt:holidays'] : timetables['odpt:weekdays'];

          var time = _(table).reduce(function(prev, cur) {
            if (cur['odpt:departureStation'] === 'odpt.Station:TokyoMetro.Tozai.Urayasu') {
              return cur['odpt:departureTime'];
            }
            return prev;
          }, null);
          if (time) {
            deferred.resolve(time);
          } else {
            deferred.reject(null);
          }
        });
      return deferred.promise;
    }
  });
