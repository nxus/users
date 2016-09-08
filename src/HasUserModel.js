import {HasModels} from 'nxus-storage'

export default class HasUserModel extends HasModels {
  modelNames() {
    return {'users_user': 'User'}
  }
}
