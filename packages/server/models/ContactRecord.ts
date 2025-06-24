import { types } from 'mobx-state-tree';

export default types.model('ContactRecord', {
  message: types.string,
  timestamp: types.string,
  email: types.string,
  firstname: types.string,
  lastname: types.string,
});
