'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function ($scope, $http, $q) {
    // When you use mock, please set 'usingMock:true,'
    // in server/config/environment/development.js
    var MOCK = false;

    // filter
    $scope.in30mins = function (input) {
      return parseInt(input.timeToCurrentStation) <= 30;
    };

    $http.get('/api/tokyometro/trains/delayed').success(function (trains) {
      $scope.trains = trains;
    });

    $scope.railways = [];
    $scope.directions = [];
    $scope.nearbyTrainList = [];

    function setStationAndDirection(station, direction) {
    $scope.nearbyTrainList = [];
    $http.get('/api/tokyometro/trains/nearby/' + station)
      .then(function (data) {
        var downDirection = data.data[direction];
        _(downDirection).forEach(function (train) {
          var item = {
            fromStation: train['odpt:fromStation'],
            toStation: train['odpt:toStation'],
            delay: train['odpt:delay'],
            delayStatus: train['odpt:delay'] !== 0 ? true : false,
            delayStatusCopy: train['odpt:delay'] === 0 ? '平常運行' : parseInt(train['odpt:delay'] / 60) + '分遅れ',
            trainNumber: train['odpt:trainNumber'],
            timeTable: '',
            trainType: train['odpt:trainType'] === 'odpt.TrainType:TokyoMetro.Local' ? '普通' : '快速',
            trainTypeCss: train['odpt:trainType'].indexOf('ocal') > -1 ? 'local' : 'rapid',
            timeToCurrentStation: '',
            barWidth: {
              'width': ''
            },
            dotRotate: '',
            rotate: 30
          };
          function now() {
            return (MOCK === true) ? new Date('2014-10-19T16:31:45+09:00') : new Date();
          }
          requestDepatureTime(item.trainNumber)
            .then(function (time) {
              item.timeTable = time;
              var milliSec = (new Date(now().toDateString() + ' ' + time) - now()) + (item.delay * 1000);
              milliSec = milliSec > 0 ? milliSec : function(){
                return (new Date((new Date(now().getFullYear(), now().getMonth(), now().getDate() + 1)).toDateString() + ' ' + time) - now()) + (item.delay * 1000);
              };
              var maximum = 30; //30min
              var pers = milliSec / (maximum * 60 * 1000);
              var prgsPerSec = 1 / 30 / 60; // 30分で１周
              var seconds = Math.floor((milliSec / 1000) % 60);

              function countdown() {
                minutes = parseInt(minutes);
                seconds = parseInt(seconds);
                if (seconds === 0 && minutes === 0) {

                } else if (seconds === 0) {
                  minutes--;
                  seconds = 59;
                } else {
                  seconds--;
                }
                minutes = minutes + '';
                seconds = seconds + '';
                if (minutes < 10 && minutes.length === 1) {
                  minutes = '0' + minutes;
                }
                if (seconds < 10 && seconds.length === 1) {
                  seconds = '0' + seconds;
                }
                item.timeToCurrentStation = minutes + ':' + seconds;
              }
              var minutes = Math.floor(((milliSec / 1000) - seconds) / 60);

              function progress() {
                if (pers <= 0) {
                  pers = 0;
                } else {
                  pers -= prgsPerSec;
                }
                item.barWidth.width = 30 + (1 - pers) * 60 + '%';
                item.dotRotate = 'rotate(' + (360 * pers) + 'deg)';
                item.rotate = 360 * pers;
              }

              countdown();
              progress();

              setInterval(function () {
                $scope.$apply(countdown);
                $scope.$apply(progress);
              }, 1000);
            });
          $scope.nearbyTrainList.push(item);
        });
      });
    }

    // set default station and direction
    $http.get('/api/tokyometro/railways')
      .then(function (data) {
        $scope.railways = data.data;
        var i = _.findIndex(data.data, function (railway) {
          return railway['owl:sameAs'] === 'odpt.Railway:TokyoMetro.Tozai';
        });
        $scope.selectedRailway = data.data[i];

        i = _.findIndex($scope.selectedRailway['odpt:stationOrder'], function (station) {
          return station['odpt:station'] === 'odpt.Station:TokyoMetro.Tozai.Urayasu';
        });
        $scope.selectedStation = $scope.selectedRailway['odpt:stationOrder'][i];
        if ($scope.apply) { // On test mode, apply() does not exist.
          $scope.apply();
        }
      });

    $scope.onStationSelected = function () {
      if (!$scope.selectedStation) {
        return;
      }
      if ($scope.currentStation === $scope.selectedStation) {
        return;
      }
      $scope.currentStation = $scope.selectedStation;
      var station = $scope.currentStation['odpt:station'];
      $http.get('/api/tokyometro/stations/raildirection/' + station)
        .then(function (data) {
          $scope.directions = data.data;
          $scope.selectedDirection = $scope.directions[0];
        });
    };

    $scope.onDirectionSelected = function () {
      if (!$scope.selectedDirection) {
        return;
      }
      if ($scope.currentDirection === $scope.selectedDirection) {
        return;
      }
      $scope.currentDirection = $scope.selectedDirection;
      setStationAndDirection($scope.selectedStation['odpt:station'],
          $scope.currentDirection['odpt:station']);
    };

    function requestDepatureTime(trainNum) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/trains/timetable/' + trainNum)
        .then(function (data) {
          var timetables = data.data;
          var table = timetables['odpt:holidays'] ? timetables['odpt:holidays'] : timetables['odpt:weekdays'];

          var time = _(table).reduce(function (prev, cur) {
            if (cur['odpt:departureStation'] === $scope.currentStation['odpt:station']) {
              return cur['odpt:departureTime'];
            }
            return prev;
          }, null);
          if (time) {

            deferred.resolve(time);
          } else {
            deferred.reject(null);
          }
        })
        .then(function () {
          $scope.nearbyTrainList = _.chain($scope.nearbyTrainList)
            .sortBy(function (key) {
              return parseInt(key.timeToCurrentStation);
            })
            .value();
        });
      return deferred.promise;
    }
  });
