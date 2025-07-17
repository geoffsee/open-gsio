// runs before anything else
import { registerSW } from 'virtual:pwa-register';

import UserOptionsStore from '../stores/UserOptionsStore';

UserOptionsStore.initialize();

try {
  const isLocal = window.location.hostname.includes('localhost');
  if (!isLocal) {
    if ('serviceWorker' in navigator) {
      // && !/localhost/.test(window.location)) {
      registerSW();
    }
    // navigator.serviceWorker.register('/service-worker.js');
  } else {
    (async () => {
      await navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.map(r => {
          r.unregister();
        });
      });
    })();
  }
} catch (e) {
  // fail silent
}
