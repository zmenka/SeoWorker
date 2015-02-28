'use strict';

describe('service', function() {

  // load modules
  beforeEach(module('seoApp'));

  // Test service availability
  it('check the existence of Api factory', inject(function(Api) {
      expect(Api).toBeDefined();
    }));
});