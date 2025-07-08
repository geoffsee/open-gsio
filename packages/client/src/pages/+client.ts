// runs before anything else
import UserOptionsStore from '../stores/UserOptionsStore';

UserOptionsStore.initialize();

try {
  const isLocal = window.location.hostname.includes('localhost');
  if (!isLocal) {
    navigator.serviceWorker.register('/service-worker.js');
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
