'use strict';

import sinon from 'sinon'
import {router} from 'nxus-router'
import {application as app} from 'nxus-core'
import UsersPermissions from '../'


describe("Users Permissions", () => {
  var module;

  before(() => {
//    sinon.spy(router, 'provide')
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
    it("should provide middleware", () => {
      router.provide.calledWith('middleware').should.be.true
    });
  });
  describe("User Middleware", () => {
    it("should be ok if not logged in", (done) => {
      module._userMiddleware({}, {}, done)
    })
    it("should add permissions to user object", (done) => {
      let req = {user: {id: 'test'}}
      let User = {
        populate: () => { return User },
        findOne: () => { return User },
        then: (cb) => { cb({roles: [{permissions: ["one", "two"]}]})}
      }
      module.models.User = User
      module._userMiddleware(req, {}, () => {
        req.user.should.have.property("permissions")
        req.user.permissions.has("one").should.be.true
        req.user.permissions.has("none").should.be.false
        done()
      })
    })
  })
  describe("Check Middleware", () => {
    let req, res
    before(() => {
      module.allow("name", "/ok")
    })
    
    beforeEach(() => {
      req = {user: {permissions: new Set()}, path: '/ok'}
      res = {status: sinon.stub().returns({send: sinon.spy()})}
    })
    it("should disallow checked path", (done) => {
      module._checkMiddleware(req, res, () => {})
      setTimeout(() => {
        res.status.called.should.be.true
        res.status().send.called.should.be.true
        done()
      }, 1500)
    })
    it("should allow checked path", (done) => {
      req.user.permissions.add("name")
      module._checkMiddleware(req, res, () => {
        res.status.called.should.be.false
        done()
      })
      res.status.called.should.be.false
    })
    it("should allow unchecked path", (done) => {
      req.path = '/other'
      module._checkMiddleware(req, res, () => {
        res.status.called.should.be.false
        done()
      })
      res.status.called.should.be.false
    })
  })
  describe("Register", () => {
    it("should register name", () => {
      module.register("test-register")
      module._permissions.should.have.property("test-register")
    })
    it("should register objectModel", () => {
      module.register("test-register", null, 'one')
      module._permissions['test-register'].should.have.property('objectModel', 'one')
    })
    it("should register roles", () => {
      module.register("test-register", ["One", "Two"])
      module._defaultRoles.should.have.property("One")
      module._defaultRoles.should.have.property("Two")
    })
  })
  describe("Guard", () => {
    it("should guard route", () => {
      module.guard("/route", 'test-register')
      let match = module._routesPermissions.match("/route")
      match.should.have.property("route", "/route")
      let x = match.fn()
      x.should.have.property("length", 2)
    })
    it("should guard handler", () => {
      let x = module.guardHandler(() => {}, 'test-register')
      x.should.be.a("function")
    })
  })
});
