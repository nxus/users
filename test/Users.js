'use strict';

import Users from '../src/index'

import TestApp from '@nxus/core/lib/test/support/TestApp';

describe("Users", () => {
  var module;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
  });
  
  describe("Load", () => {
    it("should not be null", () => Users.should.not.be.null)

    it("should be instantiated", () => {
      module = new Users(app);
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new Users(app);
    });

    it("should have controllers", () => {
      module.controllers.should.not.be.null
    });
    
    it("should provide models", () => {
      app.get('storage').provide.calledWith('model').should.be.true
    });
    it("should provide templates", () => {
      app.get('templater').provide.calledWith('template', 'user-login').should.be.true
      app.get('templater').provide.calledWith('template', 'user-profile').should.be.true
      app.get('templater').provide.calledWith('template', 'user-forgot-email').should.be.true
    });
    it("should provide routes", () => {
      app.get('router').provide.calledWith('setRoute', 'GET', '/logout').should.be.true
      app.get('router').provide.calledWith('setRoute', 'GET', '/forgot').should.be.true
      app.get('router').provide.calledWith('setRoute', 'POST', '/forgot').should.be.true
      app.get('router').provide.calledWith('setRoute', 'GET', '/login-link').should.be.true
      app.get('router').provide.calledWith('setRoute', 'GET', '/profile').should.be.true
      app.get('router').provide.calledWith('setRoute', 'GET', '/login').should.be.true
      app.get('router').provide.calledWith('setRoute', 'POST', '/profile/save').should.be.true
    });
  });
});
