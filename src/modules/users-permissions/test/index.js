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
      let req = {user: {roles: [{permissions: ["one", "two"]}]}}
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
    beforeEach(() => {
      module.allow("name", "/ok", (obj, user) => {return "hi"})
      req = {user: {permissions: new Set()}, path: '/ok'}
      res = {status: sinon.stub().returns({send: sinon.spy()})}
      
    })
    it("should disallow checked path", (done) => {
      module._checkMiddleware(req, res, () => {})
      res.status.called.should.be.true
      res.status().send.called.should.be.true
      done()
    })
    it("should allow checked path", (done) => {
      req.user.permissions.add("name")
      module._checkMiddleware(req, res, () => {
        res.status.called.should.be.false
        done()
      })
      res.status.called.should.be.false
    })
    it("should add req.checkObject", (done) => {
      req.user.permissions.add("name")
      module._checkMiddleware(req, res, () => {
        req.should.have.property("checkObject")
        req.checkObject().should.equal("hi")
        done()
      })
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
});
