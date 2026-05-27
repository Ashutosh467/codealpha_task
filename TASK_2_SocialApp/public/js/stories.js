import { stories } from './api.js';
import { getCurrentUser } from './auth.js';
import { ICONS } from './icons.js';
import { showToast } from './feed.js';

let activeStoryGroups = [];

export async function loadStoryFeed() {
  const row = document.getElementById('stories-row');
  if (!row) return;

  try {
    const data = await stories.getFeed();
    activeStoryGroups = data || [];
    row.innerHTML = '';

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Find if the current user has any active story
    const ownGroup = activeStoryGroups.find(g => g.user.id === currentUser.id);

    // 1. Render "Your Story" bubble
    const yourStoryBubble = createYourStoryBubble(currentUser, ownGroup);
    row.appendChild(yourStoryBubble);

    // 2. Render other users' story groups
    activeStoryGroups.forEach((group, index) => {
      if (group.user.id !== currentUser.id) {
        const bubble = createStoryBubble(group, activeStoryGroups, index);
        row.appendChild(bubble);
      }
    });
  } catch (err) {
    console.error('Failed to load story feed:', err);
  }
}

function createYourStoryBubble(user, ownGroup) {
  const item = document.createElement('div');
  item.className = 'story-item';

  let avatarHtml = `<div class="story-avatar no-ring">${user.username.substring(0, 2).toUpperCase()}</div>`;
  if (user.avatar_url) {
    avatarHtml = `<img src="${user.avatar_url}" class="story-avatar no-ring" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                  <div class="story-avatar no-ring" style="display:none">${user.username.substring(0, 2).toUpperCase()}</div>`;
  }

  const ringClass = ownGroup ? (ownGroup.has_unviewed ? 'story-ring-unseen' : 'story-ring-seen') : 'no-ring';

  item.innerHTML = `
    <div class="story-avatar-container ${ringClass}" style="position: relative; cursor: pointer;">
      ${avatarHtml}
      ${!ownGroup ? `
        <div style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid var(--bg-color);">+</div>
      ` : ''}
    </div>
    <span class="story-username">Your story</span>
  `;

  item.addEventListener('click', () => {
    if (ownGroup) {
      openStoryViewer([ownGroup], 0);
    } else {
      openStoryCreator();
    }
  });

  return item;
}

function createStoryBubble(group, allGroups, index) {
  const item = document.createElement('div');
  item.className = 'story-item';
  item.style.cursor = 'pointer';

  const user = group.user;
  let avatarHtml = `<div class="story-avatar">${user.username.substring(0, 2).toUpperCase()}</div>`;
  if (user.avatar_url) {
    avatarHtml = `<img src="${user.avatar_url}" class="story-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                  <div class="story-avatar" style="display:none">${user.username.substring(0, 2).toUpperCase()}</div>`;
  }

  const ringClass = group.has_unviewed ? 'story-ring-unseen' : 'story-ring-seen';
  const displayUsername = user.username.length > 10 ? user.username.substring(0, 8) + '..' : user.username;

  item.innerHTML = `
    <div class="story-avatar-container ${ringClass}">
      ${avatarHtml}
    </div>
    <span class="story-username">${displayUsername}</span>
  `;

  item.addEventListener('click', () => {
    openStoryViewer(allGroups, index);
  });

  return item;
}

/* STORY CREATOR MODAL */
let selectedStoryFile = null;

export function initStories() {
  const fileInput = document.getElementById('story-image-input');
  const dropZone = document.getElementById('story-drop-zone');
  const preview = document.getElementById('story-image-preview');
  const previewContainer = document.getElementById('story-preview-container');
  const captionInput = document.getElementById('story-caption');
  const shareBtn = document.getElementById('story-share-btn');
  const discardBtn = document.getElementById('story-discard-btn');
  const closeBtn = document.getElementById('close-story-creator');
  const charCounter = document.getElementById('story-char-counter');

  if (!fileInput) return;

  const resetCreator = () => {
    selectedStoryFile = null;
    fileInput.value = '';
    preview.src = '';
    previewContainer.style.display = 'none';
    dropZone.style.display = 'flex';
    captionInput.value = '';
    charCounter.textContent = '0/200';
    shareBtn.disabled = true;
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Only image files are allowed.', 'error');
      return;
    }
    selectedStoryFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      previewContainer.style.display = 'block';
      dropZone.style.display = 'none';
      shareBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  };

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--accent)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--border)';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  captionInput.addEventListener('input', () => {
    const len = captionInput.value.length;
    charCounter.textContent = `${len}/200`;
    if (len > 200) {
      charCounter.style.color = '#FF4757';
    } else {
      charCounter.style.color = 'var(--text-muted)';
    }
  });

  discardBtn.addEventListener('click', resetCreator);
  closeBtn.addEventListener('click', () => {
    document.getElementById('story-creator-modal').style.display = 'none';
    resetCreator();
  });

  shareBtn.addEventListener('click', async () => {
    if (!selectedStoryFile) return;

    shareBtn.disabled = true;
    shareBtn.textContent = 'Sharing...';

    // Compress client side using canvas at 0.8 quality
    const img = new Image();
    img.src = preview.src;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Max dimensions for story
      const MAX_WIDTH = 1080;
      const MAX_HEIGHT = 1920;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'story.jpg');
        formData.append('caption', captionInput.value.trim());

        try {
          await stories.create(formData);
          showToast('Your story has been shared.');
          document.getElementById('story-creator-modal').style.display = 'none';
          resetCreator();
          loadStoryFeed();
        } catch (err) {
          showToast(err.message || 'Failed to share story', 'error');
          shareBtn.disabled = false;
          shareBtn.textContent = 'Share to story';
        }
      }, 'image/jpeg', 0.8);
    };
  });
}

export function openStoryCreator() {
  const modal = document.getElementById('story-creator-modal');
  if (modal) modal.style.display = 'flex';
}

/* STORY VIEWER MODAL */
let viewGroups = [];
let currentGroupIndex = 0;
let currentStoryIndex = 0;
let progressTimer = null;
let startTime = 0;
let remainingTime = 5000;
let isPaused = false;

export function openStoryViewer(groups, startGroupIndex = 0) {
  viewGroups = groups;
  currentGroupIndex = startGroupIndex;
  currentStoryIndex = 0;

  let viewer = document.getElementById('story-viewer');
  if (!viewer) {
    viewer = createStoryViewerOverlay();
  }
  viewer.style.display = 'flex';
  showStory();
  setupViewerControls();
}

function createStoryViewerOverlay() {
  const div = document.createElement('div');
  div.id = 'story-viewer';
  div.className = 'story-viewer-overlay';
  div.innerHTML = `
    <button class="modal-close" id="close-story-viewer" style="top:20px; right:20px; font-size:24px; z-index:10010;">&times;</button>
    <div style="width: 100%; max-width: 480px; height: 100%; position: relative; display: flex; flex-direction: column; justify-content: center; background: black;">
      
      <!-- Top header panel: Progress bars, avatar, username, time, delete option -->
      <div style="position: absolute; top: 0; left: 0; right: 0; padding: 15px 15px 40px; background: linear-gradient(rgba(0,0,0,0.8), transparent); z-index: 10005;">
        <div id="story-progress-tracks" style="display: flex; gap: 4px; margin-bottom: 12px; width:100%;"></div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img id="story-viewer-avatar" src="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div id="story-viewer-avatar-fallback" style="width:32px; height:32px; border-radius:50%; background:#363636; color:white; font-size:12px; font-weight:bold; display:none; align-items:center; justify-content:center;"></div>
            <span id="story-viewer-username" style="font-weight: 600; font-size: 14px; color: white;"></span>
            <span id="story-viewer-time" style="color: rgba(255,255,255,0.6); font-size: 12px;"></span>
          </div>
          <button id="story-viewer-menu" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&middot;&middot;&middot;</button>
        </div>
      </div>

      <!-- Centered active image -->
      <img id="story-viewer-img" class="story-viewer-image" src="" />
      
      <!-- Bottom overlay text -->
      <div id="story-caption" class="story-caption-overlay"></div>

      <!-- Action: delete modal -->
      <div id="story-viewer-menu-dropdown" style="display: none; position: absolute; top: 60px; right: 15px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; z-index: 10020; min-width: 120px;">
        <button id="story-delete-btn" style="width: 100%; padding: 12px; background: none; border: none; color: #FF4757; text-align: left; font-weight: 600; cursor: pointer;">Delete</button>
      </div>

      <!-- Tap triggers (prev/next) -->
      <div class="story-tap-left" id="story-trigger-prev"></div>
      <div class="story-tap-right" id="story-trigger-next"></div>

      <!-- Views count overlay if it's our own story -->
      <div id="story-views-count-container" class="story-views-indicator">
        ${ICONS.eye || '👁'} <span id="story-views-count">0</span> views
      </div>
    </div>
  `;
  document.body.appendChild(div);
  return div;
}

function timeAgo(dateString) {
  const diffInHours = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60));
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((new Date() - new Date(dateString)) / (1000 * 60));
    return `${Math.max(1, diffInMinutes)}m ago`;
  }
  return `${diffInHours}h ago`;
}

function showStory() {
  const group = viewGroups[currentGroupIndex];
  if (!group || !group.stories.length) {
    closeStoryViewer();
    return;
  }

  const story = group.stories[currentStoryIndex];
  const user = group.user;

  // View state updating
  const avatarImg = document.getElementById('story-viewer-avatar');
  const avatarFallback = document.getElementById('story-viewer-avatar-fallback');
  const usernameEl = document.getElementById('story-viewer-username');
  const timeEl = document.getElementById('story-viewer-time');
  const imageEl = document.getElementById('story-viewer-img');
  const captionEl = document.getElementById('story-caption');
  const viewsContainer = document.getElementById('story-views-count-container');
  const viewsCountEl = document.getElementById('story-views-count');

  if (user.avatar_url) {
    avatarImg.src = user.avatar_url;
    avatarImg.style.display = 'block';
    avatarFallback.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarFallback.textContent = user.username.substring(0, 2).toUpperCase();
    avatarFallback.style.display = 'flex';
  }

  usernameEl.textContent = user.username;
  timeEl.textContent = timeAgo(story.created_at);
  imageEl.src = story.image_url;
  captionEl.textContent = story.caption || '';
  captionEl.style.display = story.caption ? 'block' : 'none';

  // Own story delete/view count check
  const currentUser = getCurrentUser();
  const menuBtn = document.getElementById('story-viewer-menu');
  const menuDropdown = document.getElementById('story-viewer-menu-dropdown');
  menuDropdown.style.display = 'none';

  if (currentUser && currentUser.id === user.id) {
    menuBtn.style.display = 'block';
    viewsContainer.style.display = 'flex';
    viewsCountEl.textContent = story.views_count || 0;
  } else {
    menuBtn.style.display = 'none';
    viewsContainer.style.display = 'none';
  }

  // Generate progress bars
  const tracksContainer = document.getElementById('story-progress-tracks');
  tracksContainer.innerHTML = '';
  group.stories.forEach((_, sIdx) => {
    const track = document.createElement('div');
    track.className = 'story-progress-bar-track';
    const fill = document.createElement('div');
    fill.className = 'story-progress-bar-fill';
    
    if (sIdx < currentStoryIndex) {
      fill.classList.add('done');
    }
    
    track.appendChild(fill);
    tracksContainer.appendChild(track);
  });

  // Mark story as viewed
  if (!story.viewed) {
    stories.view(story.id).then(res => {
      story.viewed = true;
      if (currentUser && currentUser.id === user.id) {
        viewsCountEl.textContent = res.views_count || 0;
      }
      loadStoryFeed();
    }).catch(console.error);
  }

  startProgressBar(5000);
}

function startProgressBar(duration) {
  isPaused = false;
  remainingTime = duration;
  startTime = Date.now();
  
  if (progressTimer) clearInterval(progressTimer);

  const fillEl = document.querySelectorAll('.story-progress-bar-fill')[currentStoryIndex];
  if (!fillEl) return;

  fillEl.style.transition = 'none';
  fillEl.style.width = '0%';
  
  // Force browser layout update
  void fillEl.offsetWidth;

  fillEl.style.transition = `width ${duration}ms linear`;
  fillEl.style.width = '100%';

  progressTimer = setInterval(() => {
    if (!isPaused) {
      clearInterval(progressTimer);
      nextStory();
    }
  }, duration);
}

function pauseStory() {
  if (isPaused) return;
  isPaused = true;
  clearInterval(progressTimer);
  
  const elapsed = Date.now() - startTime;
  remainingTime = Math.max(0, remainingTime - elapsed);
  
  const fillEl = document.querySelectorAll('.story-progress-bar-fill')[currentStoryIndex];
  if (fillEl) {
    const computedWidth = window.getComputedStyle(fillEl).width;
    const computedParentWidth = window.getComputedStyle(fillEl.parentElement).width;
    const percent = (parseFloat(computedWidth) / parseFloat(computedParentWidth)) * 100;
    
    fillEl.style.transition = 'none';
    fillEl.style.width = `${percent}%`;
  }
}

function resumeStory() {
  if (!isPaused) return;
  isPaused = false;
  startTime = Date.now();

  const fillEl = document.querySelectorAll('.story-progress-bar-fill')[currentStoryIndex];
  if (fillEl) {
    fillEl.style.transition = `width ${remainingTime}ms linear`;
    fillEl.style.width = '100%';
  }

  progressTimer = setInterval(() => {
    if (!isPaused) {
      clearInterval(progressTimer);
      nextStory();
    }
  }, remainingTime);
}

function nextStory() {
  const group = viewGroups[currentGroupIndex];
  if (currentStoryIndex < group.stories.length - 1) {
    currentStoryIndex++;
    showStory();
  } else if (currentGroupIndex < viewGroups.length - 1) {
    currentGroupIndex++;
    currentStoryIndex = 0;
    showStory();
  } else {
    closeStoryViewer();
  }
}

function prevStory() {
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    showStory();
  } else if (currentGroupIndex > 0) {
    currentGroupIndex--;
    currentStoryIndex = viewGroups[currentGroupIndex].stories.length - 1;
    showStory();
  } else {
    // restart current story
    showStory();
  }
}

export function closeStoryViewer() {
  if (progressTimer) clearInterval(progressTimer);
  const viewer = document.getElementById('story-viewer');
  if (viewer) viewer.style.display = 'none';
  loadStoryFeed();
}

function setupViewerControls() {
  const closeBtn = document.getElementById('close-story-viewer');
  const prevBtn = document.getElementById('story-trigger-prev');
  const nextBtn = document.getElementById('story-trigger-next');
  const menuBtn = document.getElementById('story-viewer-menu');
  const menuDropdown = document.getElementById('story-viewer-menu-dropdown');
  const deleteBtn = document.getElementById('story-delete-btn');

  closeBtn.onclick = () => closeStoryViewer();
  prevBtn.onclick = () => prevStory();
  nextBtn.onclick = () => nextStory();

  if (menuBtn) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
    };
  }

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      const group = viewGroups[currentGroupIndex];
      const story = group.stories[currentStoryIndex];
      if (!confirm('Are you sure you want to delete this story?')) return;

      try {
        await stories.delete(story.id);
        showToast('Story deleted.');
        menuDropdown.style.display = 'none';
        
        // Remove from list
        group.stories.splice(currentStoryIndex, 1);
        if (group.stories.length === 0) {
          viewGroups.splice(currentGroupIndex, 1);
          currentStoryIndex = 0;
          if (viewGroups.length === 0) {
            closeStoryViewer();
            return;
          }
          if (currentGroupIndex >= viewGroups.length) {
            currentGroupIndex = viewGroups.length - 1;
          }
        } else {
          if (currentStoryIndex >= group.stories.length) {
            currentStoryIndex = group.stories.length - 1;
          }
        }
        showStory();
      } catch (err) {
        showToast('Failed to delete story', 'error');
      }
    };
  }

  // Tap-and-hold pause
  const imageEl = document.getElementById('story-viewer-img');
  if (imageEl) {
    imageEl.onmousedown = () => pauseStory();
    imageEl.onmouseup = () => resumeStory();
    imageEl.ontouchstart = () => pauseStory();
    imageEl.ontouchend = () => resumeStory();
  }

  // Keyboard binds
  window.onkeydown = (e) => {
    const viewer = document.getElementById('story-viewer');
    if (!viewer || viewer.style.display === 'none') return;
    
    if (e.key === 'ArrowRight') {
      nextStory();
    } else if (e.key === 'ArrowLeft') {
      prevStory();
    } else if (e.key === 'Escape') {
      closeStoryViewer();
    }
  };

  // Mobile swipes
  let touchStartX = 0;
  let touchEndX = 0;
  const area = document.getElementById('story-viewer');
  if (area) {
    area.ontouchstart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseStory();
    };
    area.ontouchend = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      resumeStory();
      handleGesture();
    };
  }

  function handleGesture() {
    if (touchEndX < touchStartX - 50) {
      // Swiped left
      nextStory();
    }
    if (touchEndX > touchStartX + 50) {
      // Swiped right
      prevStory();
    }
  }
}
