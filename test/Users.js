'use strict';

import Users from '../src/index'

import {application as app} from 'nxus-core'

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
});
