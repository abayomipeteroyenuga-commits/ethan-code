(() => {
  'use strict';
  let installPrompt = null;
  const installButton = document.getElementById('installAppBtn');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    });
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (error) {}
      installPrompt = null;
      installButton.hidden = true;
    });
  }
  window.addEventListener('appinstalled', () => {
    if (installButton) installButton.hidden = true;
    installPrompt = null;
  });
})();
