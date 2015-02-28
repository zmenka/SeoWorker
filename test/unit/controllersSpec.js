'use strict';

/* jasmine specs for controllers go here */
describe('SeoWorker controllers', function() {

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('seoApp'));

  describe('AuthCtrl', function(){
    var scope, ctrl, $httpBackend, Auth;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, Authenticate) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectPOST('/api/login').
          respond({result: 'ok'});

      scope = $rootScope.$new();
      ctrl = $controller('AuthCtrl', {$scope: scope});
      Auth = Authenticate;
    }));


    it('should login', function() {
      expect(Auth.isAuthenticated).toBe(null);
      scope.login();

      $httpBackend.flush();

      expect(Auth.isAuthenticated).toEqualData(true);
    });

  });
/*

  describe('PhoneDetailCtrl', function(){
    var scope, $httpBackend, ctrl,
        xyzPhoneData = function() {
          return {
            name: 'phone xyz',
                images: ['image/url1.png', 'image/url2.png']
          }
        };


    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());

      $routeParams.phoneId = 'xyz';
      scope = $rootScope.$new();
      ctrl = $controller('PhoneDetailCtrl', {$scope: scope});
    }));


    it('should fetch phone detail', function() {
      expect(scope.phone).toEqualData({});
      $httpBackend.flush();

      expect(scope.phone).toEqualData(xyzPhoneData());
    });
  });
  */
});
