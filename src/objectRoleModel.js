import {BaseModel} from 'nxus-storage'

export default BaseModel.extend({
  attributes: {
    role: {
      model: 'users-role'
    },
    object: {
      model: 'subclass-must-define'
    },
    user: {
      model: 'users-user'
    }
  }
})
