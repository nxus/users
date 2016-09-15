'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import {application as app} from 'nxus-core'
import UsersProfile from '../'
import {users} from '../../../'


describe("Users Profile", () => {
  var module;

  before(() => {
    users.getBaseUrl = () => Promise.resolve('/')
  })
   
  describe("Load", function() {
    it("should not be null", () => UsersProfile.should.not.be.null)

    it("should be instantiated", function() {
      this.timeout(5000)
      module = new UsersProfile();
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    it("should provide routes", (done) => {
      app.onceAfter('load', () => {
        router.provide.calledWith('route', 'GET', '/profile').should.be.true
        router.provide.calledWith('route', 'POST', '/profile/save').should.be.true
        done()
      })
      app.emit('load')
    });
  });
});
