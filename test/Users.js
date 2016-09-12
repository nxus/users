'use strict';

import Users from '../src/index'

describe("Users", () => {
  var module;
   
  describe("Load", function() {
    it("should not be null", () => Users.should.not.be.null)

    it("should be instantiated", function() {
      this.timeout(5000)
      module = new Users();
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new Users();
    });

  });
});
