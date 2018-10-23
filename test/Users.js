'use strict';

import Users from '../src/index'

import {application as app} from 'nxus-core'
import sinon from 'sinon'

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

  describe("getBaseUrl", () => {
    it("should return the baseUrl", () => {
      app.config['users'] = {baseUrl: '/'}
      module = new Users();
      module.getBaseUrl().should.equal('/')
    })

    it("should append and prepend a slash if not present", () => {
      app.config['users'] = {baseUrl: 'test'}
      module = new Users();
      module.getBaseUrl().should.equal('/test/')
    })
  })

  let headers = {referer: '/'}
  let anonReq = {headers, isAuthenticated: () => {return false}}
  let anonReqXHR = {headers, isAuthenticated: () => {return false}, xhr: true}
  let authReq = {headers, isAuthenticated: () => {return true}}
  let stubRes = () => {
    let r = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
      redirect: sinon.stub().returnsThis()
    }
    return r
  }

  describe("protectedRoute", () => {
    beforeEach(() => {
      module = new Users()
    })
    it("middleware matches, anon redirects", () => {
      let res = stubRes()
      module.protectedRoute('/authed')
      module._ensureAuthenticated(Object.assign({path: '/authed'}, anonReq), res)
      //console.log(res.redirect.firstCall.args)
      res.redirect.calledWith('/test/login?redirect=%2F').should.be.true
    })
    it("middleware matches neverRedirect, anon gives 403", () => {
      let res = stubRes()
      module.protectedRoute('/authed', true)
      module._ensureAuthenticated(Object.assign({path: '/authed'}, anonReq), res)
      res.redirect.notCalled.should.be.true
      res.status.calledWith(403).should.be.true
    })
    it("protectedServiceRoute is a synonym for neverRedirect option", () => {
      let res = stubRes()
      module.protectedServiceRoute('/authed')
      module._ensureAuthenticated(Object.assign({path: '/authed'}, anonReq), res)
      res.redirect.notCalled.should.be.true
      res.status.calledWith(403).should.be.true
    })
    it("middleware matches, anon xhr gives 403", () => {
      let res = stubRes()
      module.protectedRoute('/authed')
      module._ensureAuthenticated(Object.assign({path: '/authed'}, anonReqXHR), res)
      res.redirect.notCalled.should.be.true
      res.status.calledWith(403).should.be.true
    })
    it("middleware no matches, anon continues", () => {
      let res = stubRes()
      let next = sinon.spy()
      module.protectedRoute('/authed')
      module._ensureAuthenticated(Object.assign({path: '/'}, anonReq), res, next)
      res.redirect.notCalled.should.be.true
      res.status.notCalled.should.be.true
      next.calledOnce.should.be.true
    })
    it("middleware matches, auth continues", () => {
      let res = stubRes()
      let next = sinon.spy()
      module.protectedRoute('/authed')
      module._ensureAuthenticated(Object.assign({path: '/authed'}, authReq), res, next)
      res.redirect.notCalled.should.be.true
      res.status.notCalled.should.be.true
      next.calledOnce.should.be.true
    })
  })
  describe("adminRoute", () => {
    beforeEach(() => {
      module = new Users()
    })
    it("middleware matches, anon redirects", () => {
      let res = stubRes()
      module.ensureAdmin('/admin')
      module._ensureAdmin(Object.assign({path: '/admin'}, anonReq), res)
      //console.log(res.redirect.firstCall.args)
      res.redirect.calledWith('/test/login?redirect=%2F').should.be.true
    })
    it("middleware matches, non-admin errors", () => {
      let res = stubRes()
      module.ensureAdmin('/admin')
      module._ensureAdmin(Object.assign({path: '/admin', user: {admin: false}}, authReq), res)
      //console.log(res.redirect.firstCall.args)
      res.redirect.notCalled.should.be.true
      res.status.calledWith(403).should.be.true
    })
  })
});
