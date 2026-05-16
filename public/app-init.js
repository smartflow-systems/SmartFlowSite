if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js')
      .then(function () { console.log('\u2713 Service Worker registered'); })
      .catch(function (err) { console.log('Service Worker registration failed:', err); });
  });
}
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
