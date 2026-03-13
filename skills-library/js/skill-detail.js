/* ============================================================
   skill-detail.js — Copy button logic for skill detail pages
   ============================================================ */

(function () {

  var copyBtn  = document.querySelector('.copy-btn');
  var codeBlock = document.querySelector('.skill-instruction-text code');

  if (!copyBtn || !codeBlock) return;

  copyBtn.addEventListener('click', function () {
    var text = codeBlock.innerText;

    navigator.clipboard.writeText(text).then(function () {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');

      /* Reset after 2 seconds */
      setTimeout(function () {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 2000);

    }).catch(function () {
      /* Fallback for older browsers */
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity  = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');

      setTimeout(function () {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 2000);
    });
  });

}());