/**
 * Business Agent V1 - Embeddable Chat Widget
 *
 * Usage:
 * <link rel="stylesheet" href="/widget/chat-widget.css">
 * <script src="/widget/chat-widget.js"
 *         data-webhook-url="https://<n8n-host>/webhook/business-agent/chat"
 *         data-business-name="Books N Bites"
 *         data-greeting="Hi! Ask me about our menu, hours, or bookings."
 *         data-color="#5b3a29"
 *         defer></script>
 *
 * Sends POST requests matching the "website" channel shape expected by
 * Automation/Main-Chatbot-Workflow.json:
 *   { source: "website", session_id, message, name, phone, email }
 * and expects back: { reply: "..." }
 */
(function () {
  var script = document.currentScript;
  var config = {
    webhookUrl: script.getAttribute('data-webhook-url') || '',
    businessName: script.getAttribute('data-business-name') || 'Chat with us',
    greeting: script.getAttribute('data-greeting') || 'Hi! How can we help you today?',
    color: script.getAttribute('data-color') || '#5b3a29'
  };

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var SESSION_KEY = 'bawv1_session_id';
  var sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuid();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  document.documentElement.style.setProperty('--bawv1-color', config.color);

  // --- Build DOM ---
  var launcher = document.createElement('button');
  launcher.className = 'bawv1-launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.innerHTML = '💬';

  var win = document.createElement('div');
  win.className = 'bawv1-window';
  win.innerHTML =
    '<div class="bawv1-header">' +
      '<div><strong>' + escapeHtml(config.businessName) + '</strong><small>We typically reply in a few minutes</small></div>' +
      '<button class="bawv1-close" aria-label="Close chat">×</button>' +
    '</div>' +
    '<div class="bawv1-messages"></div>' +
    '<div class="bawv1-input-row">' +
      '<input type="text" placeholder="Type a message..." aria-label="Message" />' +
      '<button type="button" class="bawv1-send">Send</button>' +
    '</div>';

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  var messagesEl = win.querySelector('.bawv1-messages');
  var inputEl = win.querySelector('input');
  var sendBtn = win.querySelector('.bawv1-send');
  var closeBtn = win.querySelector('.bawv1-close');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addMessage(text, who) {
    var el = document.createElement('div');
    el.className = 'bawv1-msg ' + who;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function toggle(open) {
    var isOpen = win.classList.contains('bawv1-open');
    var willOpen = open === undefined ? !isOpen : open;
    win.classList.toggle('bawv1-open', willOpen);
    if (willOpen && !messagesEl.dataset.greeted) {
      addMessage(config.greeting, 'bot');
      messagesEl.dataset.greeted = '1';
    }
    if (willOpen) inputEl.focus();
  }

  launcher.addEventListener('click', function () { toggle(); });
  closeBtn.addEventListener('click', function () { toggle(false); });

  function send() {
    var text = inputEl.value.trim();
    if (!text) return;
    if (!config.webhookUrl) {
      addMessage('Chat is not configured yet (missing webhook URL).', 'bot');
      return;
    }
    addMessage(text, 'user');
    inputEl.value = '';
    sendBtn.disabled = true;

    var typingEl = addMessage('...', 'typing');

    fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'website',
        session_id: sessionId,
        message: text
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        typingEl.remove();
        addMessage(data && data.reply ? data.reply : "Sorry, I didn't get a response - please try again.", 'bot');
      })
      .catch(function () {
        typingEl.remove();
        addMessage('Sorry, something went wrong. Please try again later or contact us directly.', 'bot');
      })
      .finally(function () {
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') send();
  });
})();
