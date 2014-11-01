'use strict';

angular.module('metroLifeApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];

    $http.get('/api/tokyometro/trains/delayed').success(function(trains) {
      $scope.trains = trains;
    });


    var nearbyTrainList = {
    	0:{
    		station:'行徳',
    		delay:100,
    		delayStatusCss:'normal',
    		timeTable:'17:00',
    		trainType:'普通',
    		trainTypeCss:'normal',
    		timeToCurrentStation:'10:12',
    		barWidth: {'width':'70%'},
    		dotPosition: {'transform':'rotate(10deg)'},
    		dotRotate: 'rotate(100deg)',//初期値
    		rotate: 10
    	},
    	1:{
    		station:'妙典',
    		delay:110,
    		delayStatusCss:'delay',
    		timeTable:'17:25',
    		trainType:'快速',
    		trainTypeCss:'rapid',
    		timeToCurrentStation:'14:48',
    		barWidth: {'width':'40%'},
    		dotPosition: {'transform':'rotate(40deg)'},
    		dotRotate: 'rotate(300deg)',
    		rotate: 30
    	}
    };
    $scope.currentStation = 'odpt.Station:TokyoMetro.Tozai.Urayasu';
    $scope.endTime = 30;
    $scope.destination = '中野行';
    $scope.timeToCurrentStation = '10:12';
    $scope.delayStatus = '通常運行';
    $scope.trainType = nearbyTrainList.trainType;



    //列車が後何分でつくか

    //残り時間による円軌道上のポジション

    //

    $scope.directions = [
		{direction:'上り'}, {direction:'下り'}
	];
	$scope.selectedDirection = $scope.directions[0];


	nearbyTrainList = [];
    setTimeout(function(){
	    var promise = $http.get('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu');
		promise.then(function(data) {

			var nearby = data.data;
			var ge = nearby['odpt.Station:TokyoMetro.Tozai.NishiFunabashi'];

			for(var i = 0 ; i < ge.length ; i++ ){
				nearbyTrainList.push({
					fromStation 		: ge[i]['odpt:fromStation'],
					delay 				: ge[i]['odpt:delay'],
					delayStatusCss 	: ge[i]['odpt:delay'] === 0 ? 'normal':'delay',
					trainNumber 		: ge[i]['odpt:trainNumber'],
					timeTable 			: '',
		    		trainType 			: ge[i]['odpt:trainType']==='odpt.TrainType:TokyoMetro.Local'?'普通':'快速',
		    		trainTypeCss		: ge[i]['odpt:trainType'].indexOf('ocal') > -1 ? 'local' : 'rapid',
		    		timeToCurrentStation:'',
		    		barWidth			: {'width':''},
		    		dotPosition			: {'transform':''},
		    		dotRotate			: 'rotate(300deg)',
		    		rotate 				: 30
				});
				getTimeTable(ge[i]['odpt:trainNumber']);
			}
	    })
	    .then(function(){
			console.log(nearbyTrainList);

   			$scope.nearbyTrainList = nearbyTrainList;

   			setInterval(function() {
   				for (var i=0; i<nearbyTrainList.length; i++){

			    	nearbyTrainList[i].rotate -= (1/360);
			    	nearbyTrainList[i].dotRotate =
              'rotate(' + nearbyTrainList[i].rotate + 'deg)';

					$scope.$apply();
   				}


		    }, 100);

	    });
    },200);

    function getTimeTable(trainNum){

    	var promise = $http.get('/api/tokyometro/trains/timetable/' + trainNum);
		promise.then(function(data) {

			var trainTimeTable = data.data;
			var table = trainTimeTable['odpt:holidays'] ? trainTimeTable['odpt:holidays'] : trainTimeTable['odpt:weekdays'];


			var time, departureTime, departureStation;

		    for(var i = 0; i < table.length; i++){
		    	departureStation = table[i]['odpt:departureStation'];
		    	departureTime = table[i]['odpt:departureTime'];
		    	if( departureStation === 'odpt.Station:TokyoMetro.Tozai.Urayasu' ){
		    		time = departureTime;
		    	}
		    }

		    for (var j = 0; j < nearbyTrainList.length; j++){
		      var  miriSec, seconds, minutes;
		    	if(nearbyTrainList[j].trainNumber === trainNum){
		    		nearbyTrainList[j].timeTable = time;
		    		miriSec = (new Date((new Date()).toDateString() + ' ' + time) - new Date()) + nearbyTrainList[j].delay;
		    		seconds = Math.floor((miriSec / 1000) % 60);
		    		minutes = Math.floor(((miriSec / 1000) - seconds) / 60);

		    		//リミットを超える電車を配列から削除
		    		if(minutes >= $scope.endTime){
		    			delete nearbyTrainList[j];
		    		}else{
		    			nearbyTrainList[j].timeToCurrentStation = minutes+':'+seconds;
		    		}

		    		var pers = miriSec / ($scope.endTime * 60 * 1000);
	    			nearbyTrainList[j].defaultPersent = pers;
	    			nearbyTrainList[j].barWidth = { 'width' : ( 1 - pers ) * 100 + '%'};
	    			nearbyTrainList[j].dotRotate = 'rotate('+(360*pers)+'deg)';
	    			nearbyTrainList[j].rotate = 360 * pers;
	    			console.log(j);


		    	}
		    }

	    });
    }


  });
