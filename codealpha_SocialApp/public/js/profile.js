import { users, posts, follows, saves } from './api.js';
import { getCurrentUser } from './auth.js';
import { ICONS } from './icons.js';
import { openPostLightbox } from './explore.js';

let profileUser = null;
let activeTab = 'posts'; // 'posts' or 'saved'
let profilePosts = [];
let savedPosts = [];

export function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export async function initProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  const currentUser = getCurrentUser();
  
  const targetUsername = username || currentUser.username;
  
  try {
    profileUser = await users.getProfile(targetUsername);
    renderProfileHeader();
    setupProfileTabs();
    await loadProfileGrid();
    
    // Check if deep linking to a specific post
    const postToOpen = urlParams.get('post');
    if (postToOpen) {
      const activeList = activeTab === 'posts' ? profilePosts : savedPosts;
      const idx = activeList.findIndex(p => p.id === postToOpen);
      if (idx !== -1) {
        openPostLightbox(activeList[idx], activeList, idx);
      }
    }
  } catch (err) {
    console.error(err);
    document.getElementById('profile-header-container').innerHTML = `<div style="text-align:center; padding:80px; color:var(--text-muted);">User not found</div>`;
    document.getElementById('posts-container').innerHTML = '';
  }
}

function renderProfileHeader() {
  const currentUser = getCurrentUser();
  const header = document.getElementById('profile-header-container');
  if (!header) return;

  const isOwnProfile = currentUser.id === profileUser.id;
  const initials = profileUser.username.substring(0, 2).toUpperCase();
  
  let avatarHtml = `<div class="profile-avatar">${initials}</div>`;
  if (profileUser.avatar_url) {
    avatarHtml = `<img src="${profileUser.avatar_url}" class="profile-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                  <div class="profile-avatar" style="display:none">${initials}</div>`;
  }
  
  let actionBtnHtml = '';
  if (isOwnProfile) {
    actionBtnHtml = `<button class="btn btn-secondary" id="edit-profile-btn" style="padding:6px 16px;font-size:14px;background:#363636;border:none;color:white;">Edit profile</button>
                     <input type="file" id="avatar-upload" accept="image/*" style="display:none;">`;
  } else {
    actionBtnHtml = `<button class="btn ${profileUser.is_following ? 'btn-secondary' : 'btn-primary'}" id="follow-btn" style="padding:6px 16px;font-size:14px;border:none;color:white;cursor:pointer;">
      ${profileUser.is_following ? 'Following' : 'Follow'}
    </button>`;
  }
  
  header.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-container" style="position:relative; cursor:${isOwnProfile?'pointer':'default'}" id="avatar-click-zone">
        ${avatarHtml}
        ${isOwnProfile ? actionBtnHtml.replace('id="edit-profile-btn"', 'style="display:none;"') : ''}
      </div>
      <div class="profile-info">
        <div class="profile-title-row">
          <h2 class="profile-username" style="color:white; margin:0;">${profileUser.username}</h2>
          ${!isOwnProfile ? actionBtnHtml : `<button class="btn btn-secondary" id="edit-profile-btn-desktop" style="padding:6px 16px;font-size:14px;background:#363636;border:none;color:white;cursor:pointer;">Edit profile</button>`}
        </div>
        <div class="profile-stats">
          <span><strong>${profileUser.post_count}</strong> posts</span>
          <span class="stat-btn" data-type="followers"><strong>${profileUser.follower_count}</strong> followers</span>
          <span class="stat-btn" data-type="following"><strong>${profileUser.following_count}</strong> following</span>
        </div>
        <div class="profile-name" style="font-weight:600; color:white; margin-bottom:4px;">${profileUser.display_name || profileUser.username}</div>
        <div class="profile-bio" id="bio-text" style="color:white; margin-bottom:12px;">${profileUser.bio || ''}</div>
        
        <div id="edit-profile-inline" style="display:none; margin-top:15px; background:#262626; padding:15px; border-radius:8px;">
          <input type="text" id="edit-name" class="input-field" placeholder="Name" value="${profileUser.display_name || ''}">
          <textarea id="edit-bio" class="input-field" placeholder="Bio" rows="3">${profileUser.bio || ''}</textarea>
          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn btn-secondary" id="cancel-edit-btn" style="background:transparent; color:white; border:none; cursor:pointer;">Cancel</button>
            <button class="btn btn-primary" id="save-edit-btn" style="color:white; border:none; cursor:pointer;">Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Follow action
  const followBtn = document.getElementById('follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      try {
        const isFollowing = followBtn.classList.contains('btn-secondary');
        followBtn.disabled = true;
        followBtn.textContent = isFollowing ? 'Follow' : 'Following';
        followBtn.className = `btn ${isFollowing ? 'btn-primary' : 'btn-secondary'}`;
        
        const res = await follows.toggleFollow(profileUser.username);
        profileUser.is_following = res.following;
        profileUser.follower_count = res.followers_count;
        followBtn.disabled = false;
        
        renderProfileHeader();
      } catch (err) {
        followBtn.disabled = false;
        showToast(err.message, 'error');
      }
    });
  }
  
  // Edit profile inline toggle
  const editBtnDesktop = document.getElementById('edit-profile-btn-desktop');
  const editBtnMobile = document.getElementById('edit-profile-btn');
  const editInline = document.getElementById('edit-profile-inline');
  const bioText = document.getElementById('bio-text');
  
  const showEditForm = () => {
    editInline.style.display = 'block';
    bioText.style.display = 'none';
    if(editBtnDesktop) editBtnDesktop.style.display = 'none';
  };
  const hideEditForm = () => {
    editInline.style.display = 'none';
    bioText.style.display = 'block';
    if(editBtnDesktop) editBtnDesktop.style.display = 'inline-block';
  };
  
  if (editBtnDesktop) editBtnDesktop.addEventListener('click', showEditForm);
  if (editBtnMobile && !editBtnDesktop) editBtnMobile.addEventListener('click', showEditForm);
  
  const cancelEdit = document.getElementById('cancel-edit-btn');
  if (cancelEdit) cancelEdit.addEventListener('click', hideEditForm);
  
  const saveEdit = document.getElementById('save-edit-btn');
  if (saveEdit) {
    saveEdit.addEventListener('click', async () => {
      const name = document.getElementById('edit-name').value;
      const bio = document.getElementById('edit-bio').value;
      try {
        const res = await users.updateProfile({ display_name: name, bio });
        profileUser.display_name = res.user.display_name;
        profileUser.bio = res.user.bio;
        
        const localUser = JSON.parse(localStorage.getItem('user'));
        localUser.display_name = res.user.display_name;
        localUser.bio = res.user.bio;
        localStorage.setItem('user', JSON.stringify(localUser));
        
        renderProfileHeader();
        showToast('Profile updated!');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Avatar upload
  if (isOwnProfile) {
    const avatarZone = document.getElementById('avatar-click-zone');
    const avatarInput = document.getElementById('avatar-upload');
    avatarZone.addEventListener('click', (e) => {
      if (e.target !== editBtnMobile && e.target !== editBtnDesktop) {
        avatarInput.click();
      }
    });
    
    avatarInput.addEventListener('change', async () => {
      if (!avatarInput.files[0]) return;
      try {
        const res = await users.uploadAvatar(avatarInput.files[0]);
        profileUser.avatar_url = res.user.avatar_url;
        
        const localUser = JSON.parse(localStorage.getItem('user'));
        localUser.avatar_url = res.user.avatar_url;
        localStorage.setItem('user', JSON.stringify(localUser));
        
        renderProfileHeader();
        showToast('Avatar updated!');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Follow stats modals
  document.querySelectorAll('.stat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showFollowModal(btn.dataset.type);
    });
  });
}

function setupProfileTabs() {
  const currentUser = getCurrentUser();
  const tabsContainer = document.getElementById('profile-tabs-container');
  if (!tabsContainer) return;

  // Tabs are only relevant for the user's own profile to view saved bookmarks
  const isOwnProfile = currentUser.id === profileUser.id;

  if (isOwnProfile) {
    tabsContainer.innerHTML = `
      <div class="profile-tab active" data-tab="posts">Posts</div>
      <div class="profile-tab" data-tab="saved">Saved</div>
    `;
    
    tabsContainer.querySelectorAll('.profile-tab').forEach(tab => {
      tab.onclick = async () => {
        tabsContainer.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        await loadProfileGrid();
      };
    });
  } else {
    tabsContainer.innerHTML = `
      <div class="profile-tab active" style="cursor: default;">Posts</div>
    `;
  }
}

async function showFollowModal(type) {
  const modal = document.getElementById('follow-modal');
  const title = document.getElementById('follow-modal-title');
  const list = document.getElementById('follow-modal-list');
  
  if (!modal || !title || !list) return;

  title.textContent = type === 'followers' ? 'Followers' : 'Following';
  list.innerHTML = '<div class="skeleton" style="height:100px; width:100%;"></div>';
  modal.style.display = 'flex';
  
  try {
    let res;
    if (type === 'followers') {
      res = await follows.getFollowers(profileUser.username);
      renderUserList(res.followers, list);
    } else {
      res = await follows.getFollowing(profileUser.username);
      renderUserList(res.following, list);
    }
  } catch(err) {
    list.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

function renderUserList(usersList, container) {
  if (usersList.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">No users found.</div>';
    return;
  }
  
  container.innerHTML = '';
  usersList.forEach(u => {
    const initials = u.username.substring(0, 2).toUpperCase();
    let avatarHtml = `<div class="post-author-avatar" style="width:40px; height:40px; font-size:16px;">${initials}</div>`;
    if (u.avatar_url) avatarHtml = `<img src="${u.avatar_url}" class="post-author-avatar" style="width:40px; height:40px; object-fit:cover;" />`;
    
    const div = document.createElement('div');
    div.style = "display:flex; align-items:center; gap:10px; margin-bottom:15px;";
    div.innerHTML = `
      <a href="/profile.html?username=${u.username}">${avatarHtml}</a>
      <div>
        <a href="/profile.html?username=${u.username}" style="font-weight:bold; color:white; font-size:14px;">${u.username}</a>
        <div style="font-size:12px; color:var(--text-muted)">${u.display_name || ''}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

async function loadProfileGrid() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const sq = document.createElement('div');
    sq.className = 'skeleton';
    sq.style.aspectRatio = '1';
    container.appendChild(sq);
  }

  try {
    let postsData = [];
    if (activeTab === 'posts') {
      const res = await posts.getUserPosts(profileUser.username);
      profilePosts = res.posts || [];
      postsData = profilePosts;
    } else {
      const res = await saves.getSaved(profileUser.username);
      savedPosts = res || [];
      postsData = savedPosts;
    }

    container.innerHTML = '';
    
    if (postsData.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:80px; color:var(--text-muted); font-size:14px;">
        ${activeTab === 'posts' ? 'No posts yet.' : 'No saved posts yet.'}
      </div>`;
    } else {
      postsData.forEach((p, idx) => {
        if (!p.image_url) return;
        const item = document.createElement('div');
        item.className = 'grid-item fade-in';
        item.innerHTML = `
          <img src="${p.image_url}" loading="lazy" alt="" />
          <div class="grid-item-overlay">
            <span style="display:flex; align-items:center; gap:5px;">❤️ ${p.likes_count || 0}</span>
            <span style="display:flex; align-items:center; gap:5px;">💬 ${p.comments_count || 0}</span>
          </div>
        `;
        
        item.addEventListener('click', () => {
          openPostLightbox(p, postsData, idx);
        });
        container.appendChild(item);
      });
    }
  } catch(err) {
    console.error(err);
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:red;">Error loading posts</div>`;
  }
}
