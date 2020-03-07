import 'modern-normalize/modern-normalize.css';
import '../css/main.css';

import './truthtrick.mjs';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
