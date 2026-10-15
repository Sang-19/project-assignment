const API_BASE = 'http://localhost:5000/api/auth';
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
notifyEmail.value = localStorage.getItem('email') || '';

async function sendNotification(email) {
  if (!email) {
    showMessage('Please enter an email address.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

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
  } catch (err) {
    showMessage('Network error while sending notification.', 'error');
  }
}

document.getElementById('notify-form').addEventListener('submit', (e) => {
  e.preventDefault();
  sendNotification(notifyEmail.value.trim());
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = './index.html';
});
