import { auth, users } from './api.js';
import { ICONS } from './icons.js';

let currentUser = null;

export async function setupAuth(onSuccess) {
  const token = localStorage.getItem('token');
  const authModal = document.getElementById('auth-modal');
  const mainApp = document.getElementById('main-app');
  
  const isIndex = window.location.pathname === '/' || window.location.pathname === '/index.html';

  if (token) {
    try {
      const data = await auth.getMe();
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      if(authModal) authModal.style.display = 'none';
      if(mainApp) mainApp.style.display = 'flex';
      
      // Update all sidebar/nav elements
      document.querySelectorAll('.current-user-avatar').forEach(el => {
        if (currentUser.avatar_url) {
          el.innerHTML = `<img src="${currentUser.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
        } else {
          el.textContent = currentUser.username.substring(0, 2).toUpperCase();
        }
      });
      
      document.querySelectorAll('.current-user-name').forEach(el => {
        el.textContent = currentUser.display_name || currentUser.username;
      });
      
      document.querySelectorAll('.current-user-username').forEach(el => {
        el.textContent = currentUser.username;
      });
      
      document.querySelectorAll('.profile-link').forEach(el => {
        el.href = `/profile.html?username=${currentUser.username}`;
      });

      // Notification badge logic
      const notifCount = localStorage.getItem('notif_count') || 0;
      const navHeart = document.getElementById('nav-heart-icon');
      if (navHeart && notifCount > 0) {
        navHeart.innerHTML = ICONS.heart + '<div class="notification-badge"></div>';
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      if (isIndex) {
        if(authModal) authModal.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
      } else {
        window.location.href = '/';
      }
    }
  } else {
    if (isIndex) {
      if(authModal) authModal.style.display = 'flex';
      if(mainApp) mainApp.style.display = 'none';
    } else {
      window.location.href = '/';
    }
  }

  // Auth Forms logic (only relevant on index)
  if (isIndex) {
    const tabs = document.querySelectorAll('.tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabs && loginForm && registerForm) {
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          if (tab.dataset.tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
          } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
          }
        });
      });

      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
          const data = await auth.login({ email, password });
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.reload();
        } catch (err) {
          alert(err.message);
        }
      });

      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
          const data = await auth.register({ username, email, password });
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.reload();
        } catch (err) {
          alert(err.message);
        }
      });
    }
  }

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    });
  });
}

export function getCurrentUser() {
  return currentUser || JSON.parse(localStorage.getItem('user'));
}
