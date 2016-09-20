import {BaseModel} from 'nxus-storage'

export default BaseModel.extend({
  identity: 'users-role',
  attributes: {
    role: {
      type: 'string'
    },
    permissions: {
      type: 'array'
    },

    users: {
      collection: 'users-user'
      via: 'roles'
    }
  }
})
