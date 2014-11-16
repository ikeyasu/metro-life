'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function ($scope, $http, $q) {
    // When you use mock, please set 'usingMock:true,'
    // in server/config/environment/development.js
    var MOCK = false;

    function getNow() {
      return (MOCK === true) ? new Date('2014-10-19T16:31:45+09:00') : new Date();
    }
    function getTommorow(now) {
      now = now ? now : getNow();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }
    function getTimeLeftFromDayAndTrainTime(day, traintime, now) {
      now = now ? now : getNow();
      return (new Date(day.toDateString() + ' ' + traintime)) - now;
    }
    function getTimeLeft(traintime, now) {
      now = now ? now : getNow();
      var milliSec = getTimeLeftFromDayAndTrainTime(now, traintime, now);
      if (milliSec < 0) {
        // becoming tommorow
        milliSec = getTimeLeftFromDayAndTrainTime(getTommorow(now), traintime, now);
      }
      return milliSec;
    }
    $scope.getTimeLeft = getTimeLeft; // for test

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
          requestDepatureTime(item.trainNumber)
            .then(function (time) {
              item.timeTable = time;
              var milliSec = getTimeLeft(time) + (item.delay * 1000);
              var MAXIMUM_TIMELEFT = 30 * 1000; // Show upcoming trains in 30 mins (30,000 milli-sec)
              var PROGRESS_PER_SECOND = 1 / 30 / 60; // Go around on 30 mins
              var dotPosition = milliSec / (MAXIMUM_TIMELEFT * 60);
              var seconds = Math.floor((milliSec / 1000) % 60);
              var minutes = Math.floor(((milliSec / 1000) - seconds) / 60);

              function countdown() {
                minutes = parseInt(minutes);
                seconds = parseInt(seconds);
                if (seconds === 0 && minutes === 0) {
                  var i = _.findIndex($scope.nearbyTrainList, function (train) {
                    return train === item;
                  });
                  if (i >= 0) {
                    $scope.nearbyTrainList.splice(i, 1);
                  }
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

              function progress() {
                if (dotPosition <= 0) {
                  dotPosition = 0;
                } else {
                  dotPosition -= PROGRESS_PER_SECOND;
                }
                item.barWidth.width = 30 + (1 - dotPosition) * 60 + '%';
                item.dotRotate = 'rotate(' + (360 * dotPosition) + 'deg)';
                item.rotate = 360 * dotPosition;
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
      })
      .then(function(){
        $scope.loading ="true";
        console.log($scope.nearbyTrainList);
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
