'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import Users from '../'


describe("Users Login Routes", () => {
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
      router.provide.calledWith('route', 'GET', '/logout').should.be.true
      router.provide.calledWith('route', 'GET', '/forgot').should.be.true
      router.provide.calledWith('route', 'POST', '/forgot').should.be.true
      router.provide.calledWith('route', 'GET', '/login-link').should.be.true
      router.provide.calledWith('route', 'GET', '/login').should.be.true
    });
  });
});
