const API_BASE = 'http://localhost:5000/api/auth';
const messageEl = document.getElementById('message');

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function showMessage(text, kind = 'error') {
  messageEl.textContent = text;
  messageEl.className = `message ${kind}`;
}

const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const isLogin = tab.dataset.tab === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    signupForm.classList.toggle('hidden', isLogin);
    showMessage('');
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage('Signing in...', 'success');

  const payload = {
    username: document.getElementById('login-username').value.trim(),
    password: document.getElementById('login-password').value,
  };

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await readResponse(res);

    if (!res.ok) return showMessage(data.error || 'Login failed.');

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    if (data.email) localStorage.setItem('email', data.email);

    showMessage('Login successful! Redirecting...', 'success');
    window.location.href = './dashboard.html';
  } catch (err) {
    showMessage(
      'Cannot reach the backend. Make sure backend/server.js is running on port 5000.'
    );
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage('Creating your account...', 'success');

  const payload = {
    username: document.getElementById('signup-username').value.trim(),
    email: document.getElementById('signup-email').value.trim(),
    password: document.getElementById('signup-password').value,
  };

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await readResponse(res);

    if (!res.ok) return showMessage(data.error || 'Sign up failed.');

    showMessage('Account created! You can now log in.', 'success');

    document.getElementById('login-username').value = payload.username;
    signupForm.reset();
    document.querySelector('.tab[data-tab="login"]').click();
  } catch (err) {
    showMessage(
      'Cannot reach the backend. Make sure backend/server.js is running on port 5000.'
    );
  }
});

const params = new URLSearchParams(window.location.search);
if (params.get('error') === 'google_auth_failed') {
  showMessage('Google sign-in failed. Please try again.');
}
