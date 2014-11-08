'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function($scope, $http, $q, $interval) {

    // filter
    $scope.in30mins = function(input) {
      return parseInt(input.timeToCurrentStation) <= 30;
    };

    $http.get('/api/tokyometro/trains/delayed').success(function(trains) {
      $scope.trains = trains;
    });

    $scope.directions = [];

    $scope.nearbyTrainList = [];

    $http.get('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu')
    .then(function(data) {
      var downDirection = data.data['odpt.Station:TokyoMetro.Tozai.NishiFunabashi'];
      _(downDirection).forEach(function(train) {
        var item = {
          fromStation: train['odpt:fromStation'],
          toStation:train['odpt:toStation'],
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
          dotRotate: '',
          rotate: 30
        };
        requestDepatureTime(item.trainNumber)
          .then(function(time) {
            item.timeTable = time;
            var miriSec = (new Date((new Date()).toDateString() + ' ' + time) - new Date()) + (item.delay * 1000);
            miriSec = miriSec > 0 ? miriSec : 0;
            var maximum = 30;//30min
            var pers = miriSec / ( maximum * 60 * 1000);
        	var prgsPerSec = 1 / 30 / 60; // 30分で１周
            var seconds = Math.floor((miriSec / 1000) % 60);
            var minutes = Math.floor(((miriSec / 1000) - seconds) / 60);

            countdown();
            progress();

			setInterval(function() {
			  	$scope.$apply(countdown);
			  	$scope.$apply(progress);
			}, 1000);

            function countdown(){
            	minutes = parseInt(minutes);
            	seconds = parseInt(seconds);
            	if(seconds === 0 && minutes === 0){


            	}else if (seconds === 0){
            		minutes--;
            		seconds = 59;
            	}else{
            		seconds--;
            	}
            	minutes = minutes + "";
            	seconds = seconds + "";
            	if(minutes < 10 && minutes.length === 1)minutes = "0" + minutes;
            	if(seconds < 10 && seconds.length === 1)seconds = "0" + seconds;
            	item.timeToCurrentStation = minutes + ':' + seconds;
            }
            function progress(){
            	if (pers <= 0){
            		pers = 0;
            	}else{
            		pers -= prgsPerSec;
            	}
	            item.barWidth.width = 30 + (1 - pers) * 60 + '%';
	            item.dotRotate = 'rotate(' + (360 * pers) + 'deg)';
	            item.rotate = 360 * pers;
            }
          });
        $scope.nearbyTrainList.push(item);
      });
    });

    $scope.railways = [];
    $http.get('/api/tokyometro/railways')
      .then(function(data) {
        $scope.railways = data.data;
        var i = _.findIndex(data.data, function(railway) {
          return railway['owl:sameAs'] === 'odpt.Railway:TokyoMetro.Tozai';
        });
        $scope.selectedRailway = data.data[i];

        i = _.findIndex($scope.selectedRailway['odpt:stationOrder'], function(station) {
          return station['odpt:station'] === 'odpt.Station:TokyoMetro.Tozai.Urayasu';
        });
        $scope.selectedStation = $scope.selectedRailway['odpt:stationOrder'][i];
        if ($scope.apply) { // On test mode, apply() does not exist.
          $scope.apply();
        }
      });

    $scope.showDirectionMenu = function() {
      if (!$scope.selectedStation) {
        return;
      }
      if ($scope.currentStationModel === $scope.selectedStation) {
        return;
      }
      $scope.currentStationModel = $scope.selectedStation;
      var station = $scope.currentStationModel['odpt:station'];
      $http.get('/api/tokyometro/stations/raildirection/' + station)
        .then(function(data) {
          $scope.directions = data.data;
          $scope.selectedDirection = $scope.directions[0];
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
        })
        .then(function(){
			$scope.nearbyTrainList = _.chain($scope.nearbyTrainList)
				.sortBy(function(key) {return parseInt(key.timeToCurrentStation);})
				.value();
		});
      return deferred.promise;
    }
  });
