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
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }
    function getDateObjFromTimeString(time, now) {
      now = now ? now : getNow();
      var date = new Date(now.toDateString() + ' ' + time);
      var diff = date - now;
      if (diff < 0) {
        date = getDateObjFromTimeString(time, getTommorow(now));
      }
      return date;
    }
    $scope.getDateObjFromTimeString = getDateObjFromTimeString; // for test

    // filter
    $scope.in30mins = function (input) {
      if (!input || !input.timespan) {
        return false;
      }
      return (input.timespan.value / 1000 / 60) < 30;
    };



    // Update for 1 sec.
    setInterval(function() {
      $scope.$apply();
    }, 1000);

    $scope.railways = [];
    $scope.directions = [];
    $scope.nearbyTrainList = [];

    $scope.changeCenter = function (index){
      $scope.selectedTrain = index;
      $scope.selectedIndex = index;
    }

    function removeItem(item) {
      var i = _.findIndex($scope.nearbyTrainList, function (train) {
        return train === item;
      });
      if (i >= 0) {
        $scope.nearbyTrainList.splice(i, 1);
      }
    }
    var timerIds = [];

    function setStationAndDirection(station, direction) {
    _(timerIds).forEach(function(timerId) {
      window.clearInterval(timerId);
    });
    timerIds = [];
    $scope.nearbyTrainList = [];
    $http.get('/api/tokyometro/trains/nearby/' + station)
      .then(function (data) {
        var downDirection = data.data[direction];
        _(downDirection).forEach(function (train) {
          var item = {
            delayStatus: train['odpt:delay'] !== 0 ? true : false,
            delayStatusCopy: train['odpt:delay'] === 0 ? '平常運行' : parseInt(train['odpt:delay'] / 60) + '分遅れ',
            dateObjToArrive: null,
            trainType: train['odpt:trainType'] === 'odpt.TrainType:TokyoMetro.Local' ? '普通' : '快速',
            trainTypeCss: train['odpt:trainType'].indexOf('ocal') > -1 ? 'local' : 'rapid',
            timeToCurrentStation: '',
            timespan: null,
            barWidth: 0,
            dotRotate: '',
          };
          requestDepatureTime(train['owl:sameAs'])
            .then(function (time) {
              var MAXIMUM_TIMELEFT = 30 * 60; // Show upcoming trains in 30 mins (1800 sec)
              item.dateObjToArrive = getDateObjFromTimeString(time);
              var timerId = countdown(
                    function(ts) {
                      var position = (ts.value / 1000) / (MAXIMUM_TIMELEFT);
                      if (position > 1.0) {
                        return;
                      }
                      if (ts.value < 0) {
                        // refresh
                        setStationAndDirection($scope.selectedStation['odpt:station'],
                            $scope.currentDirection['odpt:station']);
                        return;
                      }
                      item.timeToCurrentStation =
                           ('0' + ts.minutes).substr(-2) + ':' + ('0' + ts.seconds).substr(-2);
                      item.barWidth = 30 + (1 - position) * 60 + '%';
                      item.dotRotate = 'rotate(' + (360 * position) + 'deg)';
                      if (!item.timespan) {
                        item.timespan = ts;
                        $scope.nearbyTrainList.push(item);
                        $scope.nearbyTrainList =
                          $scope.nearbyTrainList.sort(function(a, b) {
                            return a.timespan.value - b.timespan.value;
                          });
                      }
                      item.timespan = ts;
                    },
                    item.dateObjToArrive,
                    /*jslint bitwise: true */
                    countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
                timerIds.push(timerId);
            });
        });
      })
      .then(function(){
        $scope.selectedTrain = 0;
        $scope.selectedIndex = 0;
        $scope.loading ='true';
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

    function getDayType(date) {
      date = date ? date : new Date();
      var w = ['holidays','weekdays','weekdays','weekdays','weekdays','weekdays','saturdays'];
      return w[date.getDay()];
    }

    function requestDepatureTime(train) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/trains/timetable/' + train + '/' + getDayType())
        .then(function (data) {
          var table = data.data;

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
        });
      return deferred.promise;
    }
  });
