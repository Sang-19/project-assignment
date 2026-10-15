const API_BASE = 'https://project-assignment-wyi7.onrender.com/api/auth';
const messageEl = document.getElementById('message');

function showMessage(text, kind = 'success') {
  messageEl.textContent = text;
  messageEl.className = `message ${kind}`;
  if (text) {
    setTimeout(() => {
      if (messageEl.textContent === text) showMessage('');
    }, 4000);
  }
}

const params = new URLSearchParams(window.location.search);
const oauthToken = params.get('token');

if (oauthToken) {
  localStorage.setItem('token', oauthToken);

  const oauthUsername = params.get('username');
  const oauthEmail = params.get('email');

  if (oauthUsername) localStorage.setItem('username', oauthUsername);
  if (oauthEmail) localStorage.setItem('email', oauthEmail);

  window.history.replaceState({}, document.title, './dashboard.html');
}

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = './index.html';
}

const username = localStorage.getItem('username') || 'user';
document.getElementById('welcome-text').textContent = `Welcome @${username}`;

const notifyEmail = document.getElementById('notify-email');
const notifyForm = document.getElementById('notify-form');
const notifySubmit = notifyForm.querySelector('button[type="submit"]');
let notificationPending = false;
notifyEmail.value = localStorage.getItem('email') || '';

async function sendNotification(email) {
  if (!email) {
    showMessage('Please enter an email address.', 'error');
    return;
  }

  if (notificationPending) return;

  notificationPending = true;
  notifySubmit.disabled = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });
    const responseText = await res.text();
    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { error: responseText };
      }
    }

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = './index.html';
      return;
    }

    if (!res.ok) {
      showMessage(data.error || 'Failed to send notification.', 'error');
      return;
    }

    showMessage(`✅ ${data.message}`, 'success');
  } catch {
    showMessage(
      'The email request timed out or the backend could not be reached.',
      'error'
    );
  } finally {
    clearTimeout(timeout);
    notificationPending = false;
    notifySubmit.disabled = false;
  }
}

notifyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendNotification(notifyEmail.value.trim());
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = './index.html';
});
