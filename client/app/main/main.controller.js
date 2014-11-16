'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function ($scope, $http, $q) {
    // When you use mock, please set 'usingMock:true,'
    // in server/config/environment/development.js
    var MOCK = false;

    function getNow() {
      return (MOCK === true) ? new Date('2014-10-19T16:31:45+09:00') : new Date();
    }

    function addDay(date, days) {
      date = date ? date : getNow();
      var timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
      var time = date.getTime();
      var now = new Date();
       var timezoneOffset2;

      time += (1000 * 60 * 60 * 24) * days;
      now.setTime(time);

      timezoneOffset2 = now.getTimezoneOffset() * 60 * 1000;
      if (timezoneOffset !== timezoneOffset2) {
        var diff = timezoneOffset2 - timezoneOffset;
        time += diff;
        now.setTime(time);
      }

      return now;
    }

    function getYesterday(date) {
      return addDay(date, -1);
    }

    function getTommorow(date) {
      return addDay(date, 1);
    }

    function getDateObjFromTimeString(time, now) {
      now = now ? now : getNow();
      if (parseInt(time) < 4 && now.getHours() > 4) {
        return new Date(getTommorow(now).toDateString() + ' ' + time);
      }
      return new Date(now.toDateString() + ' ' + time);

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
    };

    var timerIds = [];

    function setStationAndDirection(station, direction) {
    _(timerIds).forEach(function(timerId) {
      window.clearInterval(timerId);
    });
    timerIds = [];
    $scope.nearbyTrainList = [];
    var MAXIMUM_TIMELEFT = 30 * 60; // Show upcoming trains in 30 mins (1800 sec)

    function addTrainToNearbyTrainList(train, time, isTimetable) {
      var delay = train['odpt:delay'] ? train['odpt:delay'] : 0;
      var dateObjToArrive = getDateObjFromTimeString(time);
      dateObjToArrive.setTime(dateObjToArrive.getTime() + (delay));
      var item = {
        depatureTime: time,
        isTimetable: isTimetable,
        isTimetableCss: isTimetable ? 'timetable' : '',
        delayStatus: train['odpt:delay'] ? true : false,
        delayStatusCopy: train['odpt:delay'] ? (train['odpt:delay'] / 60) + '分遅れ' : '平常運行',
        dateObjToArrive: dateObjToArrive,
        trainType: train['odpt:trainType'] === 'odpt.TrainType:TokyoMetro.Local' ? '普通' : '快速',
        trainTypeCss: train['odpt:trainType'].indexOf('ocal') > -1 ? 'local' : 'rapid',
        timeToCurrentStation: '',
        timespan: null,
        barWidth: 0,
        dotRotate: '',
      };
      var timerId = countdown(
          function(ts) {
            var position = (ts.value / 1000) / (MAXIMUM_TIMELEFT);
            if (position > 1.0) {
              return;
            }
            if (ts.value < 0 && item.added) {
              // refresh
              setStationAndDirection($scope.selectedStation['odpt:station'],
                  $scope.currentDirection['odpt:station']);
              return;
            } else if (ts.value < 0 && !item.added) {
              return;
            }
            item.timeToCurrentStation =
              ('0' + ts.minutes).substr(-2) + ':' + ('0' + ts.seconds).substr(-2);
            item.barWidth = 30 + (1 - position) * 60 + '%';
            item.dotRotate = 'rotate(' + (360 * position) + 'deg)';
            if (!item.timespan) {
              item.timespan = ts;
              item.added = true;
              var i = _.findIndex($scope.nearbyTrainList, function(a) {
                return a.depatureTime === item.depatureTime;
              });
              if (i > -1) {
                if ($scope.nearbyTrainList[i].isTimetable) {
                  $scope.nearbyTrainList[i] = item;
                }
              } else {
                $scope.nearbyTrainList.push(item);
              }
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
    }

    requestStationTimetable(station, direction).then(function(d) {
      _(d).forEach(function(train) {
        addTrainToNearbyTrainList(train, train['odpt:departureTime'], true);
      });
    });

    $http.get('/api/tokyometro/trains/nearby/' + station)
      .then(function (data) {
        _(data.data[direction]).forEach(function (train) {
          requestDepatureTime(train['owl:sameAs'])
            .then(function (time) {
              addTrainToNearbyTrainList(train, time, false);
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
      if (date.getHours() < 4) {
        date = getYesterday(date);
      }
      var w = ['holidays','weekdays','weekdays','weekdays','weekdays','weekdays','saturdays'];
      return w[date.getDay()];
    }

    function requestStationTimetable(station, direction) {
      var deferred = $q.defer();
      $http.get('/api/tokyometro/stations/timetable/' + station + '/' + direction + '/' + getDayType())
        .then(function (data) {
          var table = data.data;

          var index = _.findIndex(table, function (cur) {
            return (getDateObjFromTimeString(cur['odpt:departureTime']) > new Date()) &&
              (getDateObjFromTimeString(cur['odpt:departureTime']) - new Date()) < 1000 * 60 * 30;
          });
          if (index > -1) {
            deferred.resolve(table.slice(index, table.length));
          } else {
            deferred.resolve([]);
          }
        });
      return deferred.promise;
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
