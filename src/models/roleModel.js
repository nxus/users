import {BaseModel} from 'nxus-storage'

export default BaseModel.extend({
  identity: 'users-role',
  attributes: {
    role: {
      type: 'string'
    },
    systemDefined: {
      type: 'boolean',
      defaultsTo: false
    },
    permissions: {
      type: 'array'
    },

    users: {
      collection: 'users-user',
      via: 'roles'
    }
  }
})
