/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:32:58
* @Last Modified 2016-05-20
*/

'use strict';

import {BaseModel} from 'nxus-storage'
import { Crypto } from 'cryptojs'
import crypto from 'crypto'
import _ from 'underscore'

const randomSalt = () => {
  try {
    let buf = crypto.randomBytes(24)
    return buf.toString('hex')
  }
  catch (ex) {
    console.dir(ex)
  }
}

const generateToken = (email) => {
  if (!email) email = new Date().getTime()
  return Crypto.MD5(email+randomSalt())
}

const hashPassword = (password, salt) => {
  const iterations = 42;
  let i = 0
  let hashed = password

  while (i < iterations) {
    hashed = Crypto.PBKDF2(hashed, salt, 256/8)
    i++
  }

  return hashed
}

const Roles = {
  Viewer: 10,
  Editor: 100,
  Admin: 1000
}

export default BaseModel.extend({
  identity: 'users-user',
  connection: 'default',
  attributes: {
    email: {
      type: 'string',
      unique: true
    },
    nameFirst: {
      type: 'string'
    },
    nameLast: {
      type: 'string'
    },
    position: 'string',
    enabled: 'boolean',
    salt: { 
      type: 'string'
    },
    password: {
      type: 'string',
      defaultsTo: ''
    },
    verifyToken: { 
      type: 'string'
    },
    resetPasswordToken: { 
      type: 'string'
    },
    resetPasswordExpires: 'datetime',
    verified: { 
      type: 'boolean', 
      defaultsTo: false 
    },
    role: { 
      type: 'integer', 
      defaultsTo: 0 
    },
    roles: {
      collection: 'users-role',
      via: 'users'
    },
    team: {
      model: 'users-team'
    },
    admin: { 
      type: 'boolean', 
      defaultsTo: false
    },
    lastLogIn: { 
      type: 'datetime'
    },
    metadata: { 
      type: 'json', 
      defaultsTo: {} 
    },
    setRole: function(role) {
      this.role = Roles[role]
    },
    resetVerifyToken: function() {
      this.verifyToken = generateToken()
    },
    resetResetPasswordToken: function() {
      this.resetPasswordToken = generateToken()
    },
    name: function() {
      return `${this.nameFirst} ${this.nameLast}`
    },
    displayName: function() {
      return `${this.name()} (${this.email})`
    },
    findTeamEditors: function(teamId, cb) {
      this.find({team:teamId, role:Roles.Editor}, cb)
    },
    isAdmin: function() {
      return this.role == Roles.Admin
    },
    findTeamViewers: function(teamId, cb) {
      this.find({team:teamId, role:Roles.Viewer}, cb)
    },
    isEditor: function() {
      return this.role == Roles.Editor || this.isAdmin()
    },
    // Determines whether the passed password matches the hashed password
    validPassword: function(password) {
      if (!password || !this.password) return false
      return hashPassword(password, this.salt) == this.password
    },
    // Sets the 'lastLogIn' value for the user to the current time.
    loggedIn: function() {
      this.lastLogIn = Date.now()
      this.save()
    },
    isViewer: function() {
      return this.role == Roles.Viewer
    }
  },

  beforeValidate: function(values, cb) {
    if(!values.salt || values.salt == "") values.salt = randomSalt()
    if(!values.verifyToken || values.verifyToken == "") values.verifyToken = generateToken()
    if(!values.resetPasswordToken || values.resetPasswordToken == "") values.resetPasswordToken = generateToken()
    cb();
  },
  
  beforeCreate: function(values, cb) {
    // An example encrypt function defined somewhere
    if(values.password && values.password.length > 0) values.password = hashPassword(values.password, values.salt)
    cb();
  },

  beforeUpdate: function(values, cb) {
    // An example encrypt function defined somewhere
    this
      .findOne(values.id)
      .then((usr) => {
        if(usr.password == values.password) return cb()
        if(typeof values.password == 'undefined' || values.password.length == 0 || values.password == "") {
          delete values.password
        }
        if(values.password) {
          values.password = hashPassword(values.password, values.salt)
        } else {
          values.password = usr.password
          values.salt = usr.salt
        }
        cb();
      });
  },

  isViewer: function(user) {
    return user.role == Roles.Viewer
  },

  isEditor: function(user) {
    return user.role == Roles.Editor || this.isAdmin(user)
  },

  isAdmin: function(user) {
    return user.role == Roles.Admin
  },

  getRole: function(role) {
    return Roles[role]
  }
});
