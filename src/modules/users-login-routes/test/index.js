'use strict';

import Promise from 'bluebird'

import sinon from 'sinon'
import {router} from 'nxus-router'
import {application as app} from 'nxus-core'
import UsersLoginRoutes from '../'
import {users} from 'nxus-users'


describe("Users Login Routes", () => {
  var module;

  before(() => {
    users.getBaseUrl = () => Promise.resolve('/')
  })
   
  describe("Load", function() {
    it("should not be null", () => UsersLoginRoutes.should.not.be.null)

    it("should be instantiated", function() {
      this.timeout(5000)
      module = new UsersLoginRoutes();
      module.should.not.be.null;
    });
  });

  describe("Init", () => {
    it("should provide routes", (done) => {
      app.onceAfter('load', () => {
        router.provide.calledWith('route', 'GET', '/logout').should.be.true
        router.provide.calledWith('route', 'GET', '/forgot').should.be.true
        router.provide.calledWith('route', 'POST', '/forgot').should.be.true
        router.provide.calledWith('route', 'GET', '/login-link').should.be.true
        router.provide.calledWith('route', 'GET', '/login').should.be.true
        done()
      })
      app.emit('load')
    });
  });
});
