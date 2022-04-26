import 'modern-normalize/modern-normalize.css';
import '../css/main.css';
import '../images/github.svg';

import './truthTrick';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/truth-trick/service-worker.js');
  });
}
