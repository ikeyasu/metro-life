'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function($scope, $http, $q) {

    // filter
    $scope.in30mins = function(input) {
      return parseInt(input.timeToCurrentStation) <= 30;
    };

    $http.get('/api/tokyometro/trains/delayed').success(function(trains) {
      $scope.trains = trains;
    });

    requestJapaneseStationName('odpt.Station:TokyoMetro.Tozai.Urayasu')
      .then(function(name) {
        $scope.currentStation = name;
      });
    $scope.endTime = 30;
    $scope.destination = '中野行';
    $scope.timeToCurrentStation = '10:12';
    $scope.delayStatus = '通常運行';

    $scope.directions = [{
      direction: '上り'
    }, {
      direction: '下り'
    }];
    $scope.selectedDirection = $scope.directions[0];

    $scope.nearbyTrainList = [];

    $http.get('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu').
    then(function(data) {
      var downDirection = data.data['odpt.Station:TokyoMetro.Tozai.NishiFunabashi'];
      _(downDirection).forEach(function(train) {
        var item = {
          fromStation: train['odpt:fromStation'],
          delay: train['odpt:delay'],
          delayStatusCss: train['odpt:delay'] === 0 ? 'normal' : 'delay',
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
            var seconds = Math.floor((miriSec / 1000) % 60);
            var minutes = Math.floor(((miriSec / 1000) - seconds) / 60);

            item.timeToCurrentStation = minutes + ':' + seconds;

            var pers = miriSec / ($scope.endTime * 60 * 1000);
            item.barWidth = {
              'width': (1 - pers) * 100 + '%'
            };
            item.dotRotate = 'rotate(' + (360 * pers) + 'deg)';
            item.rotate = 360 * pers;
          });
        $scope.nearbyTrainList.push(item);
      });
    });

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

    function requestJapaneseStationName(station) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/stations/' + station)
        .then(function(data) {
          if (data.data) {
            deferred.resolve(data.data[0]["dc:title"]);
          } else {
            deferred.reject(null);
          }
        });
      return deferred.promise;
    }
  });
