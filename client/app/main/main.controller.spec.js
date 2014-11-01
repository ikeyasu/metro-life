'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('metroLifeApp'));

  var MainCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/tokyometro/trains/delayed')
      .respond([]);
    $httpBackend.expectGET('/api/tokyometro/trains/nearby/odpt.Station:TokyoMetro.Tozai.Urayasu')
      .respond({'odpt.Station:TokyoMetro.Tozai.NishiFunabashi':[{'@context':'http://vocab.tokyometroapp.jp/context_odpt_Train.jsonld','@type':'odpt:Train','@id':'urn:ucode:_00001C000000000000010000030CAB32','dc:date':'2014-11-01T16:01:50+09:00','dct:valid':'2014-11-01T16:03:20+09:00','odpt:frequency':90,'odpt:railway':'odpt.Railway:TokyoMetro.Tozai','owl:sameAs':'odpt.Train:TokyoMetro.Tozai.A1549S','odpt:trainNumber':'A1549S','odpt:trainType':'odpt.TrainType:TokyoMetro.Local','odpt:delay':0,'odpt:startingStation':'odpt.Station:JR-East.Chuo.Mitaka','odpt:terminalStation':'odpt.Station:TokyoMetro.Tozai.NishiFunabashi','odpt:fromStation':'odpt.Station:TokyoMetro.Tozai.Kasai','odpt:toStation':null,'odpt:railDirection':'odpt.RailDirection:TokyoMetro.NishiFunabashi','odpt:trainOwner':'odpt.TrainOwner:TokyoMetro'}]});
    $httpBackend.expectGET('/api/tokyometro/trains/timetable/A1549S')
      .respond({"@context":"https://vocab.tokyometroapp.jp/context_odpt_TrainTimetable.jsonld","@id":"urn:ucode:_00001C000000000000010000030D12FA","@type":"odpt:TrainTimetable","owl:sameAs":"odpt.TrainTimetable:TokyoMetro.Tozai.A1549S.SaturdaysHolidays","odpt:trainNumber":"A1549S","odpt:railway":"odpt.Railway:TokyoMetro.Tozai","odpt:operator":"odpt.Operator:TokyoMetro","dc:date":"2014-10-24T21:56:31+09:00","odpt:trainType":"odpt.TrainType:TokyoMetro.Local","odpt:railDirection":"odpt.RailDirection:TokyoMetro.NishiFunabashi","odpt:startingStation":"odpt.Station:JR-East.Chuo.Mitaka","odpt:saturdays":[{"odpt:departureTime":"15:24","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Nakano"},{"odpt:departureTime":"15:26","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Ochiai"},{"odpt:departureTime":"15:29","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Takadanobaba"},{"odpt:departureTime":"15:32","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Waseda"},{"odpt:departureTime":"15:35","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kagurazaka"},{"odpt:departureTime":"15:37","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Iidabashi"},{"odpt:departureTime":"15:39","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kudanshita"},{"odpt:departureTime":"15:41","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Takebashi"},{"odpt:departureTime":"15:43","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Otemachi"},{"odpt:departureTime":"15:44","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Nihombashi"},{"odpt:departureTime":"15:46","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kayabacho"},{"odpt:departureTime":"15:48","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MonzenNakacho"},{"odpt:departureTime":"15:50","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kiba"},{"odpt:departureTime":"15:53","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Toyocho"},{"odpt:departureTime":"15:55","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MinamiSunamachi"},{"odpt:departureTime":"15:58","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.NishiKasai"},{"odpt:departureTime":"16:03","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kasai"},{"odpt:departureTime":"16:06","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Urayasu"},{"odpt:departureTime":"16:08","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MinamiGyotoku"},{"odpt:departureTime":"16:10","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Gyotoku"},{"odpt:departureTime":"16:12","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Myoden"},{"odpt:departureTime":"16:15","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.BarakiNakayama"},{"odpt:arrivalTime":"16:18","odpt:arrivalStation":"odpt.Station:TokyoMetro.Tozai.NishiFunabashi"}],"odpt:holidays":[{"odpt:departureTime":"15:24","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Nakano"},{"odpt:departureTime":"15:26","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Ochiai"},{"odpt:departureTime":"15:29","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Takadanobaba"},{"odpt:departureTime":"15:32","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Waseda"},{"odpt:departureTime":"15:35","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kagurazaka"},{"odpt:departureTime":"15:37","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Iidabashi"},{"odpt:departureTime":"15:39","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kudanshita"},{"odpt:departureTime":"15:41","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Takebashi"},{"odpt:departureTime":"15:43","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Otemachi"},{"odpt:departureTime":"15:44","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Nihombashi"},{"odpt:departureTime":"15:46","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kayabacho"},{"odpt:departureTime":"15:48","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MonzenNakacho"},{"odpt:departureTime":"15:50","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kiba"},{"odpt:departureTime":"15:53","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Toyocho"},{"odpt:departureTime":"15:55","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MinamiSunamachi"},{"odpt:departureTime":"15:58","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.NishiKasai"},{"odpt:departureTime":"16:03","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Kasai"},{"odpt:departureTime":"16:06","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Urayasu"},{"odpt:departureTime":"16:08","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.MinamiGyotoku"},{"odpt:departureTime":"16:10","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Gyotoku"},{"odpt:departureTime":"16:12","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.Myoden"},{"odpt:departureTime":"16:15","odpt:departureStation":"odpt.Station:TokyoMetro.Tozai.BarakiNakayama"},{"odpt:arrivalTime":"16:18","odpt:arrivalStation":"odpt.Station:TokyoMetro.Tozai.NishiFunabashi"}],"odpt:train":"odpt.Train:TokyoMetro.Tozai.A1549S","odpt:terminalStation":"odpt.Station:TokyoMetro.Tozai.NishiFunabashi","odpt:trainOwner":"odpt.TrainOwner:TokyoMetro"});

    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of trains to the scope', function () {
    $httpBackend.flush();
    expect(scope.trains.length).toBe(0);
  });

  it('should attach a object of trains to the scope', function () {
    $httpBackend.flush();
    expect(scope.nearbyTrainList).toBeDefined();
    console.log(scope.nearbyTrainList[0]);
    expect(scope.nearbyTrainList[0].fromStation).toEqual('odpt.Station:TokyoMetro.Tozai.Kasai');
  });
});
