import { ServerCoordinator } from '@open-gsio/coordinators';
import Router from '@open-gsio/router';
import { error } from 'itty-router';

export { ServerCoordinator };

export default Router.Router().catch(error);
