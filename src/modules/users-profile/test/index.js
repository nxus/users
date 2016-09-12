'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import Users from '../'


describe("Users Profile", () => {
  var module;

  before(() => {
//    sinon.spy(router, 'provide')
  })
   
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

    it("should provide routes", () => {
      router.provide.calledWith('route', 'GET', '/profile').should.be.true
      router.provide.calledWith('route', 'POST', '/profile/save').should.be.true
    });
  });
});
