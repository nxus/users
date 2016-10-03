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
  },

  roleUsers(object) {
    return this.find({object: object}).populate('role').populate('user').then((roles) => {
      let ret = {}
      for (let r of roles) {
        let name = r.role.role
        if (!ret[name]) {
          ret[name] = []
        }
        ret[name].push(r.user)
      }
      return ret
    })
  }
})
