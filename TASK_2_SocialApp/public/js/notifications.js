import { notifications, follows } from './api.js';
import { ICONS } from './icons.js';
import { showToast } from './feed.js';

let notificationsData = [];
let activeTab = 'all';

// Dynamically inject the notification panel HTML when loaded
export function initNotifications() {
  if (document.getElementById('notif-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.className = 'notif-panel';
  panel.innerHTML = `
    <div class="notif-panel-header">
      <h2 style="font-size: 20px; font-weight: bold; margin: 0;">Notifications</h2>
      <button id="notif-mark-all-read" style="background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-size: 14px;">Mark all read</button>
    </div>
    <div class="notif-panel-tabs">
      <div class="notif-tab active" data-tab="all">All</div>
      <div class="notif-tab" data-tab="follow">Follows</div>
      <div class="notif-tab" data-tab="like">Likes</div>
      <div class="notif-tab" data-tab="comment">Comments</div>
    </div>
    <div id="notif-list" class="notif-list-container">
      <!-- Loading skeletons or items -->
    </div>
  `;
  document.body.appendChild(panel);

  // Wire up tabs
  const tabs = panel.querySelectorAll('.notif-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderNotifications();
    });
  });

  // Wire up Mark all read
  document.getElementById('notif-mark-all-read').addEventListener('click', async () => {
    try {
      await notifications.readAll();
      notificationsData.forEach(n => n.is_read = true);
      updateNotificationBadge(0);
      renderNotifications();
      showToast('All marked as read');
    } catch (err) {
      console.error(err);
    }
  });

  // Wire click listener to sidebar heart button to toggle drawer
  const heartBtns = document.querySelectorAll('.nav-heart-btn, #nav-heart-icon-btn, [data-nav="notifications"]');
  heartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleNotificationPanel();
    });
  });

  // Close panel on clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside = panel.contains(e.target);
    const clickedHeart = Array.from(heartBtns).some(btn => btn.contains(e.target));
    if (!isClickInside && !clickedHeart && panel.classList.contains('active')) {
      panel.classList.remove('active');
    }
  });

  // Start polling
  startNotificationPolling();
  loadNotifications(false); // initial fetch
}

export async function toggleNotificationPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;

  const isActive = panel.classList.toggle('active');
  if (isActive) {
    // Panel opened: mark all as read
    try {
      await loadNotifications(true);
      await notifications.readAll();
      notificationsData.forEach(n => n.is_read = true);
      updateNotificationBadge(0);
    } catch (err) {
      console.error(err);
    }
  }
}

export async function loadNotifications(showLoading = true) {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (showLoading) {
    list.innerHTML = `
      <div style="padding: 20px; display:flex; flex-direction:column; gap:12px;">
        <div class="skeleton" style="height:50px; width:100%;"></div>
        <div class="skeleton" style="height:50px; width:100%;"></div>
        <div class="skeleton" style="height:50px; width:100%;"></div>
      </div>
    `;
  }

  try {
    const data = await notifications.getAll();
    notificationsData = data.notifications || [];
    updateNotificationBadge(data.unread_count || 0);
    renderNotifications();
  } catch (err) {
    console.error('Failed to load notifications:', err);
    list.innerHTML = `<div style="padding:20px; text-align:center; color:red;">Failed to load.</div>`;
  }
}

function timeAgo(dateString) {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  list.innerHTML = '';

  const filtered = notificationsData.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'follow') return notif.type === 'follow';
    if (activeTab === 'like') return notif.type === 'like';
    if (activeTab === 'comment') return notif.type === 'comment' || notif.type === 'mention';
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted); font-size:14px;">Activity on your posts will appear here.</div>`;
    return;
  }

  filtered.forEach(notif => {
    const row = document.createElement('div');
    row.className = `notification-row ${!notif.is_read ? 'unread' : ''}`;
    
    // Avatar
    let avatarHtml = `<div style="width:44px; height:44px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${notif.sender_username.substring(0, 2).toUpperCase()}</div>`;
    if (notif.sender_avatar_url) {
      avatarHtml = `<img class="avatar-md" src="${notif.sender_avatar_url}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                    <div style="width:44px; height:44px; border-radius:50%; background:#262626; display:none; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${notif.sender_username.substring(0, 2).toUpperCase()}</div>`;
    }

    // Text Templates
    let text = '';
    if (notif.type === 'like') {
      text = `<b>${notif.sender_username}</b> liked your photo.`;
    } else if (notif.type === 'comment') {
      const cleanComment = notif.comment_content ? (notif.comment_content.substring(0, 30) + (notif.comment_content.length > 30 ? '...' : '')) : '';
      text = `<b>${notif.sender_username}</b> commented: "${cleanComment}"`;
    } else if (notif.type === 'follow') {
      text = `<b>${notif.sender_username}</b> started following you.`;
    } else if (notif.type === 'mention') {
      text = `<b>${notif.sender_username}</b> mentioned you in a comment.`;
    }

    // Post Thumbnail
    let thumbnailHtml = '';
    if (notif.post_image_url) {
      thumbnailHtml = `<img class="notif-thumbnail" src="${notif.post_image_url}" />`;
    }

    // Follow Back Button if follow type
    let followBtnHtml = '';
    if (notif.type === 'follow') {
      followBtnHtml = `<button class="follow-btn-inline follow-back-btn" data-username="${notif.sender_username}">Follow</button>`;
    }

    row.innerHTML = `
      ${avatarHtml}
      <div class="notif-content">
        <div>${text}</div>
        <div class="notif-time">${timeAgo(notif.created_at)}</div>
      </div>
      ${thumbnailHtml}
      ${followBtnHtml}
    `;

    // Click row handler: navigate to post or profile
    row.addEventListener('click', (e) => {
      // If they clicked the follow back button, ignore row navigation
      if (e.target.classList.contains('follow-back-btn')) return;

      if (notif.post_id) {
        window.location.href = `/profile.html?username=${getCurrentUser().username}&post=${notif.post_id}`;
      } else {
        window.location.href = `/profile.html?username=${notif.sender_username}`;
      }
    });

    // Wire up Follow Back button
    const fBtn = row.querySelector('.follow-back-btn');
    if (fBtn) {
      fBtn.addEventListener('click', async () => {
        try {
          fBtn.disabled = true;
          fBtn.textContent = 'Following';
          fBtn.classList.add('following');
          await follows.toggleFollow(notif.sender_username);
        } catch (err) {
          fBtn.disabled = false;
          fBtn.textContent = 'Follow';
          fBtn.classList.remove('following');
          showToast(err.message || 'Error following user', 'error');
        }
      });
    }

    list.appendChild(row);
  });
}

export function updateNotificationBadge(count) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
    badge.classList.remove('hidden');
  } else {
    badge.style.display = 'none';
    badge.classList.add('hidden');
  }
}

function startNotificationPolling() {
  setInterval(async () => {
    try {
      const data = await notifications.getAll();
      const count = data.unread_count || 0;
      updateNotificationBadge(count);
    } catch (err) {
      console.error('Failed to poll notifications:', err);
    }
  }, 30000);
}
