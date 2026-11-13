import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Clean up any legacy client-side PIN key without disturbing curriculum or progress data
try {
  localStorage.removeItem('nilekids_teacher_pin_v1');
} catch {
  // Ignore storage access errors
}

// Force immediate SW update check and reload once when a newer worker replaces a cached one
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      registration.update().catch(() => {});
    }
  },
});

createRoot(document.getElementById('root')!).render(<App />);
