'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import Users from '../'


describe("Users Auth Middleware", () => {
  var module;

  before(() => {
    sinon.spy(router, 'provide')
  })
   
  describe("Load", function() {
    it("should not be null", () => Users.should.not.be.null)

    it("should be instantiated", function() {
      module = new Users();
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new Users();
    });

    it("should provide middleare", () => {
      router.provide.calledWith('middleware').should.be.true
    });
  });
});
