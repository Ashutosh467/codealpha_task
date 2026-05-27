import { explore, posts, comments, saves, follows } from './api.js';
import { ICONS } from './icons.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './feed.js';

let searchTimeout = null;

export async function initExplore() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (searchInput && searchResults) {
    // Show recent searches on focus if input is empty
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length === 0) {
        showRecentSearches();
      }
    });

    // Debounced search
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(searchTimeout);

      if (q.length < 2) {
        if (q.length === 0) {
          showRecentSearches();
        } else {
          searchResults.style.display = 'none';
        }
        return;
      }

      // Show skeletons
      showSearchSkeletons();

      searchTimeout = setTimeout(async () => {
        try {
          const results = await explore.search(q);
          renderSearchResults(results, q);
        } catch (err) {
          console.error(err);
          searchResults.innerHTML = '<div style="padding:15px;text-align:center;color:red;">Error searching users.</div>';
        }
      }, 300);
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }

  // Load explore grid
  await loadExploreGrid();
}

/* SEARCH RESULTS & HISTORY */
function showSearchSkeletons() {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  searchResults.innerHTML = `
    <div style="padding: 10px; display:flex; flex-direction:column; gap:8px;">
      <div class="skeleton" style="height:44px; width:100%;"></div>
      <div class="skeleton" style="height:44px; width:100%;"></div>
      <div class="skeleton" style="height:44px; width:100%;"></div>
    </div>
  `;
  searchResults.style.display = 'block';
}

function showRecentSearches() {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  const recents = JSON.parse(localStorage.getItem('recent_searches') || '[]');
  if (recents.length === 0) {
    searchResults.style.display = 'none';
    return;
  }

  searchResults.innerHTML = `
    <div style="padding: 10px; border-bottom: 1px solid var(--border); font-size:12px; font-weight:600; color:var(--text-muted); display:flex; justify-content:space-between;">
      <span>Recent</span>
      <span id="clear-recents-btn" style="color:var(--accent); cursor:pointer;">Clear All</span>
    </div>
  `;

  recents.forEach(user => {
    const row = document.createElement('div');
    row.className = 'search-result-item';
    row.style.justifyContent = 'space-between';

    let avatarHtml = `<div style="width:40px; height:40px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${user.username.substring(0, 2).toUpperCase()}</div>`;
    if (user.avatar_url) {
      avatarHtml = `<img src="${user.avatar_url}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                    <div style="width:40px; height:40px; border-radius:50%; background:#262626; display:none; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${user.username.substring(0, 2).toUpperCase()}</div>`;
    }

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" class="recent-profile-trigger">
        ${avatarHtml}
        <div>
          <div style="font-weight:600; color:white;">${user.username}</div>
          <div style="font-size:12px; color:var(--text-muted);">${user.display_name || ''}</div>
        </div>
      </div>
      <button class="remove-recent-btn" style="background:none; border:none; color:var(--text-muted); font-size:16px; cursor:pointer; padding:5px;">&times;</button>
    `;

    row.querySelector('.recent-profile-trigger').onclick = () => {
      addToRecentSearches(user);
      window.location.href = `/profile.html?username=${user.username}`;
    };

    row.querySelector('.remove-recent-btn').onclick = (e) => {
      e.stopPropagation();
      removeRecentSearch(user.id);
      showRecentSearches();
    };

    searchResults.appendChild(row);
  });

  const clearBtn = document.getElementById('clear-recents-btn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      localStorage.setItem('recent_searches', '[]');
      searchResults.style.display = 'none';
    };
  }

  searchResults.style.display = 'block';
}

function addToRecentSearches(user) {
  let recents = JSON.parse(localStorage.getItem('recent_searches') || '[]');
  // Remove duplicates
  recents = recents.filter(u => u.id !== user.id);
  recents.unshift({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    avatar_url: user.avatar_url
  });
  // Keep only 5
  if (recents.length > 5) recents.pop();
  localStorage.setItem('recent_searches', JSON.stringify(recents));
}

function removeRecentSearch(userId) {
  let recents = JSON.parse(localStorage.getItem('recent_searches') || '[]');
  recents = recents.filter(u => u.id !== userId);
  localStorage.setItem('recent_searches', JSON.stringify(recents));
}

function renderSearchResults(users, query) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  searchResults.innerHTML = '';

  if (users.length === 0) {
    searchResults.innerHTML = `<div style="padding:15px; text-align:center; color:var(--text-muted);">No results for '${query}'</div>`;
    return;
  }

  users.forEach(user => {
    const row = document.createElement('div');
    row.className = 'search-result-item';
    row.style.justifyContent = 'space-between';

    let avatarHtml = `<div style="width:40px; height:40px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${user.username.substring(0, 2).toUpperCase()}</div>`;
    if (user.avatar_url) {
      avatarHtml = `<img src="${user.avatar_url}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                    <div style="width:40px; height:40px; border-radius:50%; background:#262626; display:none; align-items:center; justify-content:center; font-weight:bold; color:var(--text-muted);">${user.username.substring(0, 2).toUpperCase()}</div>`;
    }

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" class="search-profile-trigger">
        ${avatarHtml}
        <div>
          <div style="font-weight:600; color:white;">${user.username}</div>
          <div style="font-size:12px; color:var(--text-muted);">${user.display_name || ''}</div>
        </div>
      </div>
      ${user.id !== getCurrentUser().id ? `
        <button class="follow-btn-inline search-follow-btn ${user.is_following ? 'following' : ''}" data-username="${user.username}">
          ${user.is_following ? 'Following' : 'Follow'}
        </button>
      ` : ''}
    `;

    row.querySelector('.search-profile-trigger').onclick = () => {
      addToRecentSearches(user);
      window.location.href = `/profile.html?username=${user.username}`;
    };

    const followBtn = row.querySelector('.search-follow-btn');
    if (followBtn) {
      followBtn.onclick = async (e) => {
        e.stopPropagation();
        try {
          const isFollowing = followBtn.classList.contains('following');
          followBtn.disabled = true;
          followBtn.textContent = isFollowing ? 'Follow' : 'Following';
          followBtn.classList.toggle('following');
          
          await follows.toggleFollow(user.username);
          followBtn.disabled = false;
        } catch (err) {
          followBtn.disabled = false;
          showToast(err.message || 'Error following user', 'error');
        }
      };
    }

    searchResults.appendChild(row);
  });
}

/* EXPLORE GRID */
async function loadExploreGrid() {
  const grid = document.getElementById('explore-grid');
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const sq = document.createElement('div');
    sq.className = 'skeleton';
    sq.style.aspectRatio = '1';
    grid.appendChild(sq);
  }

  try {
    const postsData = await explore.getPosts();
    grid.innerHTML = '';

    if (postsData.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:80px; color:var(--text-muted);">No posts yet — be the first!</div>';
      return;
    }

    postsData.forEach((post, index) => {
      const cell = document.createElement('div');
      cell.className = 'explore-cell fade-in';
      
      // Every 7th post is double-height
      if ((index + 1) % 7 === 0) {
        cell.classList.add('tall');
      }

      const imgUrl = post.image_url || 'css/no-image-placeholder.svg';
      cell.innerHTML = `
        <img src="${imgUrl}" loading="lazy" alt="" onerror="this.src='/uploads/no-image.jpg';" />
        <div class="explore-overlay">
          <span style="display:flex; align-items:center; gap:6px;">❤️ ${post.likes_count || 0}</span>
          <span style="display:flex; align-items:center; gap:6px;">💬 ${post.comments_count || 0}</span>
        </div>
      `;

      cell.onclick = () => {
        openPostLightbox(post, postsData, index);
      };

      grid.appendChild(cell);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:red;">Failed to load explore feed.</div>';
  }
}

/* POST LIGHTBOX MODAL (REUSABLE) */
export function openPostLightbox(post, postsList = [], currentIndex = 0) {
  let modal = document.getElementById('lightbox-modal-container');
  if (!modal) {
    modal = createLightboxModalDOM();
  }

  modal.style.display = 'flex';
  renderLightboxContent(post, postsList, currentIndex);
}

function createLightboxModalDOM() {
  const div = document.createElement('div');
  div.id = 'lightbox-modal-container';
  div.className = 'modal-overlay';
  div.style.zIndex = '9999';
  div.innerHTML = `
    <button class="modal-close" id="close-lightbox" style="top:25px; right:25px; font-size:36px; color:white; z-index:10005;">&times;</button>
    <div class="modal-content lightbox-modal" style="position:relative; max-width:960px; height:85vh; width:90%; background:black; display:flex;">
      
      <!-- Left side: contains image -->
      <div class="lightbox-left" style="flex: 1.3; height: 100%; display: flex; align-items: center; justify-content: center; position: relative;">
        <img id="lightbox-img" src="" style="max-width:100%; max-height:100%; object-fit:contain;" />
        <div id="lightbox-heart-pop" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:100px; opacity:0; pointer-events:none; z-index:5;">❤️</div>
      </div>
      
      <!-- Right side: details & comments -->
      <div class="lightbox-right" style="flex: 1; height: 100%; background: var(--surface); display: flex; flex-direction: column; border-left: 1px solid var(--border);">
        
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:14px; border-bottom:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:10px;">
            <img id="lightbox-author-avatar" src="" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div id="lightbox-author-fallback" style="width:32px; height:32px; border-radius:50%; background:#262626; color:white; font-size:12px; font-weight:bold; display:none; align-items:center; justify-content:center;"></div>
            <a id="lightbox-author-username" href="" style="font-weight:600; font-size:14px; color:white;"></a>
          </div>
          <button id="lightbox-post-menu" style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">&middot;&middot;&middot;</button>
        </div>

        <!-- Comments listing -->
        <div id="lightbox-comments-list" style="flex-grow:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:16px;"></div>

        <!-- Actions panel -->
        <div style="padding:14px; border-top:1px solid var(--border);">
          <div style="display:flex; gap:16px; margin-bottom:8px;">
            <button id="lightbox-like-btn" class="action-btn"></button>
            <button id="lightbox-comment-btn" class="action-btn">${ICONS.comment}</button>
            <button id="lightbox-share-btn" class="action-btn">${ICONS.share}</button>
            <button id="lightbox-save-btn" class="action-btn" style="margin-left:auto;"></button>
          </div>
          <div id="lightbox-likes-count" style="font-weight:600; font-size:14px; color:white; margin-bottom:6px;">0 likes</div>
          <div id="lightbox-post-time" style="color:var(--text-muted); font-size:10px; text-transform:uppercase;"></div>
        </div>

        <!-- Input box -->
        <form id="lightbox-comment-form" style="display:flex; align-items:center; padding:10px 14px; border-top:1px solid var(--border);">
          <input type="text" id="lightbox-comment-input" placeholder="Add a comment..." style="background:none; border:none; color:white; flex-grow:1; outline:none; font-size:14px;" required />
          <button type="submit" style="background:none; border:none; color:var(--accent); font-weight:600; cursor:pointer; font-size:14px;">Post</button>
        </form>

      </div>

      <!-- Delete dropdown menu overlay -->
      <div id="lightbox-menu-dropdown" style="display:none; position:absolute; top:50px; right:15px; background:var(--surface); border:1px solid var(--border); border-radius:8px; z-index:10005; overflow:hidden; min-width:120px;">
        <button id="lightbox-delete-post" style="width:100%; text-align:left; background:none; border:none; padding:12px; color:#FF4757; font-weight:600; cursor:pointer;">Delete</button>
      </div>

    </div>
  `;
  document.body.appendChild(div);
  return div;
}

function renderLightboxContent(post, postsList, currentIndex) {
  const modal = document.getElementById('lightbox-modal-container');
  const img = document.getElementById('lightbox-img');
  const authorAvatar = document.getElementById('lightbox-author-avatar');
  const authorFallback = document.getElementById('lightbox-author-fallback');
  const authorUsername = document.getElementById('lightbox-author-username');
  const likesCount = document.getElementById('lightbox-likes-count');
  const postTime = document.getElementById('lightbox-post-time');
  const likeBtn = document.getElementById('lightbox-like-btn');
  const saveBtn = document.getElementById('lightbox-save-btn');
  const commentsList = document.getElementById('lightbox-comments-list');
  const commentInput = document.getElementById('lightbox-comment-input');
  const commentForm = document.getElementById('lightbox-comment-form');
  const closeBtn = document.getElementById('close-lightbox');
  const postMenuBtn = document.getElementById('lightbox-post-menu');
  const menuDropdown = document.getElementById('lightbox-menu-dropdown');
  const deletePostBtn = document.getElementById('lightbox-delete-post');

  // Fill in content
  img.src = post.image_url || '/uploads/no-image.jpg';
  authorUsername.textContent = post.author_username;
  authorUsername.href = `/profile.html?username=${post.author_username}`;

  if (post.avatar_url) {
    authorAvatar.src = post.avatar_url;
    authorAvatar.style.display = 'block';
    authorFallback.style.display = 'none';
  } else {
    authorAvatar.style.display = 'none';
    authorFallback.textContent = post.author_username.substring(0, 2).toUpperCase();
    authorFallback.style.display = 'flex';
  }

  likesCount.textContent = `${post.likes_count || 0} likes`;
  
  // Post time ago
  const dateObj = new Date(post.created_at);
  postTime.textContent = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // Like icon state
  likeBtn.className = `action-btn like-btn ${post.is_liked ? 'liked' : ''}`;
  likeBtn.innerHTML = post.is_liked ? ICONS.heartFilled : ICONS.heart;

  // Save icon state
  saveBtn.className = `action-btn ${post.is_saved ? 'saved' : ''}`;
  saveBtn.innerHTML = ICONS.bookmark; // custom css fill rule on '.saved svg'

  // Dropdown options menu logic
  menuDropdown.style.display = 'none';
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === post.user_id) {
    postMenuBtn.style.display = 'block';
  } else {
    postMenuBtn.style.display = 'none';
  }

  postMenuBtn.onclick = (e) => {
    e.stopPropagation();
    menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
  };

  deletePostBtn.onclick = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await posts.deletePost(post.id);
      showToast('Post deleted.');
      modal.style.display = 'none';
      if (window.location.pathname.includes('explore.html')) {
        loadExploreGrid();
      } else {
        window.location.reload();
      }
    } catch (err) {
      showToast('Failed to delete post.', 'error');
    }
  };

  // Render comments + caption
  const loadCommentsList = async () => {
    commentsList.innerHTML = '';
    
    // Add original caption as first comment element
    const captionRow = document.createElement('div');
    captionRow.style.display = 'flex';
    captionRow.style.gap = '10px';
    
    let cAvatar = `<div style="width:32px; height:32px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--text-muted);">${post.author_username.substring(0,2).toUpperCase()}</div>`;
    if (post.avatar_url) {
      cAvatar = `<img src="${post.avatar_url}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                 <div style="width:32px; height:32px; border-radius:50%; background:#262626; display:none; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--text-muted);">${post.author_username.substring(0,2).toUpperCase()}</div>`;
    }

    captionRow.innerHTML = `
      ${cAvatar}
      <div style="font-size:14px;">
        <span style="font-weight:600; color:white; margin-right:6px;">${post.author_username}</span>
        <span style="color:white;">${post.content}</span>
        <div style="color:var(--text-muted); font-size:11px; margin-top:4px;">${timeAgo(post.created_at)}</div>
      </div>
    `;
    commentsList.appendChild(captionRow);

    try {
      const res = await comments.getComments(post.id);
      res.comments.forEach(c => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'flex-start';

        let commAvatar = `<div style="width:32px; height:32px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--text-muted);">${c.author_username.substring(0,2).toUpperCase()}</div>`;
        if (c.avatar_url) {
          commAvatar = `<img src="${c.avatar_url}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                        <div style="width:32px; height:32px; border-radius:50%; background:#262626; display:none; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--text-muted);">${c.author_username.substring(0,2).toUpperCase()}</div>`;
        }

        row.innerHTML = `
          <div style="display:flex; gap:10px;">
            ${commAvatar}
            <div style="font-size:14px;">
              <span style="font-weight:600; color:white; margin-right:6px;">${c.author_username}</span>
              <span style="color:white;">${c.content}</span>
              <div style="color:var(--text-muted); font-size:11px; margin-top:4px;">${timeAgo(c.created_at)}</div>
            </div>
          </div>
          ${(currentUser && (currentUser.id === c.user_id || currentUser.id === post.user_id)) ? `
            <button class="delete-comment-btn" data-id="${c.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px; padding:4px;">&times;</button>
          ` : ''}
        `;

        const dBtn = row.querySelector('.delete-comment-btn');
        if (dBtn) {
          dBtn.onclick = async () => {
            if (!confirm('Delete this comment?')) return;
            try {
              await comments.deleteComment(c.id);
              showToast('Comment deleted.');
              loadCommentsList();
              post.comments_count = Math.max(0, (post.comments_count || 1) - 1);
            } catch (err) {
              showToast('Failed to delete comment', 'error');
            }
          };
        }

        commentsList.appendChild(row);
      });
    } catch (err) {
      console.error(err);
    }
  };

  loadCommentsList();

  // Wire Like Toggle
  const toggleLike = async () => {
    try {
      const wasLiked = likeBtn.classList.contains('liked');
      let currentCount = parseInt(likesCount.textContent);

      if (wasLiked) {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = ICONS.heart;
        likesCount.textContent = `${Math.max(0, currentCount - 1)} likes`;
        post.is_liked = false;
        post.likes_count = Math.max(0, currentCount - 1);
      } else {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = ICONS.heartFilled;
        likesCount.textContent = `${currentCount + 1} likes`;
        post.is_liked = true;
        post.likes_count = currentCount + 1;
      }

      const res = await posts.toggleLike(post.id);
      post.is_liked = res.liked;
      post.likes_count = res.likes_count;
      likesCount.textContent = `${res.likes_count} likes`;
      likeBtn.className = `action-btn like-btn ${res.liked ? 'liked' : ''}`;
      likeBtn.innerHTML = res.liked ? ICONS.heartFilled : ICONS.heart;
    } catch (err) {
      showToast('Error liking post', 'error');
    }
  };
  likeBtn.onclick = toggleLike;

  // Double tap like popup heart animation
  let lastTap = 0;
  img.ondblclick = (e) => {
    if (!post.is_liked) {
      toggleLike();
    }
    showLightboxHeartPop(e.clientX, e.clientY);
  };

  // Wire Save Toggle
  saveBtn.onclick = async () => {
    try {
      const wasSaved = saveBtn.classList.contains('saved');
      saveBtn.classList.toggle('saved');
      post.is_saved = !wasSaved;

      const res = await saves.toggle(post.id);
      if (res.saved) {
        saveBtn.classList.add('saved');
      } else {
        saveBtn.classList.remove('saved');
      }
      post.is_saved = res.saved;
    } catch (err) {
      saveBtn.classList.toggle('saved');
      showToast('Error saving post', 'error');
    }
  };

  // Wire Comment Input Focus
  document.getElementById('lightbox-comment-btn').onclick = () => commentInput.focus();

  // Wire Copy Clipboard Share link
  document.getElementById('lightbox-share-btn').onclick = () => {
    const postUrl = window.location.origin + `/profile.html?username=${post.author_username}&post=${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      showToast('Link copied!');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  // Wire comment creation submit form
  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const content = commentInput.value.trim();
    if (!content) return;

    try {
      const res = await comments.createComment(post.id, content);
      commentInput.value = '';
      showToast('Comment added.');
      post.comments_count = (post.comments_count || 0) + 1;
      loadCommentsList();
    } catch (err) {
      showToast(err.message || 'Error posting comment', 'error');
    }
  };

  // Carousel key navigation setup
  window.onkeydown = (e) => {
    if (modal.style.display !== 'flex') return;

    if (e.key === 'Escape') {
      modal.style.display = 'none';
      window.onkeydown = null;
    } else if (e.key === 'ArrowRight') {
      if (currentIndex < postsList.length - 1) {
        renderLightboxContent(postsList[currentIndex + 1], postsList, currentIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        renderLightboxContent(postsList[currentIndex - 1], postsList, currentIndex - 1);
      }
    }
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
    window.onkeydown = null;
  };
}

function showLightboxHeartPop(x, y) {
  const heart = document.getElementById('lightbox-heart-pop');
  if (!heart) return;

  heart.style.animation = 'none';
  void heart.offsetWidth; // force reflow
  heart.style.animation = 'floatHeart 0.8s ease forwards';
}

function timeAgo(dateString) {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
