import { posts, comments, follows, users, saves } from './api.js';
import { getCurrentUser } from './auth.js';
import { ICONS } from './icons.js';
import { loadStoryFeed } from './stories.js';

let offset = 0;
let isLoadingMore = false;
let allLoaded = false;

export function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function timeAgo(dateString) {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}

export function renderPost(post, container, prepend = false) {
  const currentUser = getCurrentUser();
  const initials = post.author_username.substring(0, 2).toUpperCase();
  
  const postEl = document.createElement('article');
  postEl.className = 'post fade-in';
  postEl.dataset.id = post.id;
  
  let avatarHtml = `<div class="post-author-avatar">${initials}</div>`;
  if (post.avatar_url) avatarHtml = `<img src="${post.avatar_url}" class="post-author-avatar" />`;
  
  let imageHtml = '';
  if (post.image_url) {
    imageHtml = `
      <div class="post-image-container">
        <img src="${post.image_url}" class="post-image" loading="lazy" />
        ${ICONS.heartFilled.replace('svg', 'svg class="double-tap-heart"')}
      </div>`;
  }
  
  let moreBtnHtml = '';
  if (currentUser && currentUser.id === post.user_id) {
    moreBtnHtml = `<button class="post-header-more">${ICONS.more}</button>`;
  }
  
  const captionClass = post.content.length > 125 ? 'post-caption truncatable' : 'post-caption';
  const displayCaption = post.content.length > 125 ? post.content.substring(0, 125) + '... <span style="color:var(--text-muted);cursor:pointer;" class="more-text">more</span>' : post.content;

  postEl.innerHTML = `
    <div class="post-header">
      <a href="/profile.html?username=${post.author_username}" style="display:flex;align-items:center;">
        ${avatarHtml}
        <span class="post-author-name">${post.author_username}</span>
      </a>
      <span style="color:var(--text-muted); margin: 0 4px;">•</span>
      <span class="post-time">${timeAgo(post.created_at)}</span>
      ${moreBtnHtml}
    </div>
    ${imageHtml}
    <div class="post-actions">
      <button class="action-btn like-btn ${post.is_liked ? 'liked' : ''}">
        ${post.is_liked ? ICONS.heartFilled : ICONS.heart}
      </button>
      <button class="action-btn comment-btn">
        ${ICONS.comment}
      </button>
      <button class="action-btn share-btn">
        ${ICONS.share}
      </button>
      <button class="action-btn save-btn ${post.is_saved ? 'saved' : ''}" style="margin-left:auto;">
        ${ICONS.bookmark}
      </button>
    </div>
    <div class="post-likes"><span class="like-count">${post.likes_count}</span> likes</div>
    <div class="${captionClass}" data-full="${post.content.replace(/"/g, '&quot;')}">
      <span class="post-caption-username">${post.author_username}</span>
      <span class="caption-content">${displayCaption}</span>
    </div>
    ${post.comments_count > 0 ? `<div class="view-comments">View all ${post.comments_count} comments</div>` : ''}
    
    <form class="add-comment-form">
      <input type="text" class="add-comment-input" placeholder="Add a comment..." required>
      <button type="submit" class="add-comment-btn">Post</button>
    </form>
  `;

  // Like Logic
  const likeBtn = postEl.querySelector('.like-btn');
  const likeCountEl = postEl.querySelector('.like-count');
  
  const toggleLike = async () => {
    try {
      const wasLiked = likeBtn.classList.contains('liked');
      let currentCount = parseInt(likeCountEl.textContent);
      
      if (wasLiked) {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = ICONS.heart;
        likeCountEl.textContent = Math.max(0, currentCount - 1);
      } else {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = ICONS.heartFilled;
        likeCountEl.textContent = currentCount + 1;
      }

      const res = await posts.toggleLike(post.id);
      
      if (res.liked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = ICONS.heartFilled;
        likeCountEl.textContent = res.likes_count;
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = ICONS.heart;
        likeCountEl.textContent = res.likes_count;
      }
    } catch (err) {
      showToast('Error toggling like', 'error');
    }
  };

  likeBtn.addEventListener('click', toggleLike);

  // Double tap to like
  const imageContainer = postEl.querySelector('.post-image-container');
  if (imageContainer) {
    let lastTap = 0;
    const handleTap = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        if (!likeBtn.classList.contains('liked')) toggleLike();
        
        // Animation
        const heart = imageContainer.querySelector('.double-tap-heart');
        heart.classList.remove('animate');
        void heart.offsetWidth; // trigger reflow
        heart.classList.add('animate');
      }
      lastTap = currentTime;
    };
    imageContainer.addEventListener('touchend', handleTap);
    imageContainer.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (!likeBtn.classList.contains('liked')) toggleLike();
      const heart = imageContainer.querySelector('.double-tap-heart');
      heart.classList.remove('animate');
      void heart.offsetWidth;
      heart.classList.add('animate');
    });
  }

  // More/Less caption
  const moreText = postEl.querySelector('.more-text');
  if (moreText) {
    moreText.addEventListener('click', () => {
      const full = postEl.querySelector('.truncatable').dataset.full;
      postEl.querySelector('.caption-content').textContent = full;
    });
  }

  // Options Menu: Delete or Edit Post
  const moreBtn = postEl.querySelector('.post-header-more');
  if (moreBtn) {
    moreBtn.addEventListener('click', async () => {
      const choice = prompt('Choose option: "edit" or "delete" (or cancel)', 'edit');
      if (!choice) return;

      if (choice.trim().toLowerCase() === 'delete') {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
          await posts.deletePost(post.id);
          postEl.style.display = 'none';
          showToast('Post deleted');
        } catch (err) {
          showToast(err.message, 'error');
        }
      } else if (choice.trim().toLowerCase() === 'edit') {
        const currentContent = postEl.querySelector('.caption-content').textContent;
        const newCaption = prompt('Edit post caption:', currentContent);
        if (newCaption === null) return;
        try {
          await posts.editPost(post.id, newCaption.trim());
          postEl.querySelector('.caption-content').textContent = newCaption.trim();
          showToast('Post caption updated!');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  }

  // Share Copy Link logic
  postEl.querySelector('.share-btn').addEventListener('click', () => {
    const postUrl = window.location.origin + `/profile.html?username=${post.author_username}&post=${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      showToast('Link copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy share link', 'error');
    });
  });

  // Save/Bookmark logic
  const saveBtn = postEl.querySelector('.save-btn');
  saveBtn.addEventListener('click', async () => {
    try {
      const wasSaved = saveBtn.classList.contains('saved');
      saveBtn.classList.toggle('saved');

      const res = await saves.toggle(post.id);
      if (res.saved) {
        saveBtn.classList.add('saved');
      } else {
        saveBtn.classList.remove('saved');
      }
    } catch (err) {
      saveBtn.classList.toggle('saved');
      showToast('Error bookmarking post', 'error');
    }
  });

  // Comment logic
  const commentForm = postEl.querySelector('.add-comment-form');
  const commentBtn = postEl.querySelector('.comment-btn');
  const viewComments = postEl.querySelector('.view-comments');
  
  const focusComment = () => postEl.querySelector('.add-comment-input').focus();
  commentBtn.addEventListener('click', focusComment);
  
  if (viewComments) {
    viewComments.addEventListener('click', () => {
      window.location.href = `/profile.html?username=${post.author_username}&post=${post.id}`;
    });
  }

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = commentForm.querySelector('.add-comment-input');
    const content = input.value.trim();
    if (!content) return;
    try {
      await comments.createComment(post.id, content);
      input.value = '';
      showToast('Comment added');
      // Increment count local display
      post.comments_count = (post.comments_count || 0) + 1;
      if (viewComments) {
        viewComments.textContent = `View all ${post.comments_count} comments`;
      } else {
        const viewCommentsDiv = document.createElement('div');
        viewCommentsDiv.className = 'view-comments';
        viewCommentsDiv.textContent = `View all ${post.comments_count} comments`;
        viewCommentsDiv.addEventListener('click', () => {
          window.location.href = `/profile.html?username=${post.author_username}&post=${post.id}`;
        });
        postEl.insertBefore(viewCommentsDiv, commentForm);
      }
    } catch(err) {
      showToast(err.message, 'error');
    }
  });

  if (prepend) {
    container.prepend(postEl);
  } else {
    container.appendChild(postEl);
  }
}

export async function initFeed() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  // Real stories loader
  loadStoryFeed();

  try {
    const res = await posts.getFeed(offset, 10);
    container.innerHTML = ''; // clear skeletons
    
    if (res.posts.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Welcome to Instagram! Follow some people to see posts.</div>';
    } else {
      res.posts.forEach(p => renderPost(p, container));
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:red;">Error loading feed</div>`;
  }

  // Create Post Modal Logic
  const createModal = document.getElementById('create-modal');
  const createBtns = [document.getElementById('create-post-btn'), document.getElementById('mobile-create-post-btn')];
  const closeCreate = document.getElementById('close-create-modal');
  
  createBtns.forEach(b => {
    if(b) b.addEventListener('click', () => { createModal.style.display = 'flex'; });
  });
  
  if (closeCreate) closeCreate.addEventListener('click', () => { createModal.style.display = 'none'; });
  
  window.addEventListener('click', (e) => {
    if (e.target === createModal) createModal.style.display = 'none';
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && createModal) createModal.style.display = 'none';
  });

  const createForm = document.getElementById('create-post-form');
  const fileInput = document.getElementById('post-image');
  const dropZone = document.getElementById('drop-zone');
  const preview = document.getElementById('image-preview');
  
  if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'white'; });
    dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--border)'; });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        updatePreview();
      }
    });
  }

  const updatePreview = () => {
    if (fileInput.files[0]) {
      preview.src = URL.createObjectURL(fileInput.files[0]);
      preview.style.display = 'block';
      dropZone.style.display = 'none';
    }
  };
  if (fileInput) fileInput.addEventListener('change', updatePreview);

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('post-content').value;
      const imageFile = fileInput.files[0];
      
      const btn = createForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sharing...';
      
      try {
        const res = await posts.createPost({ content, image: imageFile });
        createForm.reset();
        preview.style.display = 'none';
        dropZone.style.display = 'block';
        createModal.style.display = 'none';
        
        renderPost(res.post, container, true);
        showToast('Post created!');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Share';
      }
    });
  }

  // Active pagination infinite scroll
  window.addEventListener('scroll', async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      if (!isLoadingMore && !allLoaded) {
        isLoadingMore = true;
        offset++;
        try {
          const res = await posts.getFeed(offset, 10);
          if (res.posts.length === 0) {
            allLoaded = true;
          } else {
            res.posts.forEach(p => renderPost(p, container));
          }
        } catch (err) {
          console.error(err);
        } finally {
          isLoadingMore = false;
        }
      }
    }
  });
}
