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

    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of trains to the scope', function () {
    $httpBackend.flush();
    expect(scope.trains.length).toBe(0);
  });
});
