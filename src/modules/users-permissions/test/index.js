'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import {application as app} from 'nxus-core'
import UsersPermissions from '../'


describe("Users Permissions", () => {
  var module;

  before(() => {
  })
   
  describe("Load", function() {
    it("should not be null", () => UsersPermissions.should.not.be.null)

    it("should be instantiated", function() {
      this.timeout(5000)
      module = new UsersPermissions();
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    it("should provide routes", () => {
    });
  });
});
