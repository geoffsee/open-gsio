import { types } from 'mobx-state-tree';

const ContactRecord = types.model('ContactRecord', {
  message: types.string,
  timestamp: types.string,
  email: types.string,
  firstname: types.string,
  lastname: types.string,
});

export default ContactRecord;
