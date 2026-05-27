// CSRF helper
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// Show/Hide global loading overlay
function showLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Render dynamic notifications (Bootstrap-style alerts inside #messages-container)
function showToast(message, type = 'success') {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(alertDiv);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => alertDiv.remove(), 500);
    }, 4000);
}

// Update navbar cart count badge
function updateCartBadge(count) {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'block';
        }
    }
}

// Add item to cart AJAX
async function addToCart(productId, quantity = 1) {
    showLoader();
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('quantity', quantity);
        
        const response = await fetch('/cart/add/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            updateCartBadge(data.cart_count);
            showToast(data.message, 'success');
        } else {
            showToast(data.error || 'Failed to add item to cart.', 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Network error, please try again.', 'danger');
    } finally {
        hideLoader();
    }
}

// Remove item from cart AJAX
async function removeFromCart(productId) {
    showLoader();
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        
        const response = await fetch('/cart/remove/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            updateCartBadge(data.cart_count);
            showToast(data.message, 'success');
            
            // If on cart page, remove the row
            const row = document.getElementById(`cart-row-${productId}`);
            if (row) {
                row.remove();
                
                // Update grand total
                const grandTotalEl = document.getElementById('cart-grand-total');
                if (grandTotalEl) {
                    grandTotalEl.textContent = `$${data.cart_total}`;
                }
                
                // If cart is empty now, reload to show empty state
                if (data.cart_count === 0) {
                    location.reload();
                }
            }
        } else {
            showToast(data.error || 'Failed to remove item.', 'danger');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Network error, please try again.', 'danger');
    } finally {
        hideLoader();
    }
}

// Update item quantity AJAX
async function updateQuantity(productId, quantity) {
    showLoader();
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('quantity', quantity);
        
        const response = await fetch('/cart/update/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            updateCartBadge(data.cart_count);
            
            if (data.removed) {
                showToast(data.message, 'success');
                const row = document.getElementById(`cart-row-${productId}`);
                if (row) row.remove();
                if (data.cart_count === 0) {
                    location.reload();
                }
            } else {
                // Update item total cell
                const itemTotalEl = document.getElementById(`item-total-${productId}`);
                if (itemTotalEl) {
                    itemTotalEl.textContent = `$${data.item_total}`;
                }
            }
            
            // Update grand total
            const grandTotalEl = document.getElementById('cart-grand-total');
            if (grandTotalEl) {
                grandTotalEl.textContent = `$${data.cart_total}`;
            }
        } else {
            showToast(data.error || 'Failed to update quantity.', 'danger');
            // Revert quantity input in UI to old value (reload page or fetch old)
            setTimeout(() => location.reload(), 1000);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Network error, please try again.', 'danger');
    } finally {
        hideLoader();
    }
}
