document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Gallery Swapping
    const mainImg = document.getElementById('main-gallery-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    if (mainImg && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
                
                const newSrc = thumbnail.getAttribute('data-large-src');
                const altText = thumbnail.getAttribute('data-alt') || 'Product image';
                
                // Fade effect
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    mainImg.src = newSrc;
                    mainImg.alt = altText;
                    mainImg.style.opacity = '1';
                }, 150);
            });
        });
    }

    // 2. Quantity Selector + & - Controls
    const qtyInput = document.querySelector('.qty-input');
    const btnMinus = document.querySelector('.qty-btn-minus');
    const btnPlus = document.querySelector('.qty-btn-plus');
    
    if (qtyInput) {
        const minVal = parseInt(qtyInput.getAttribute('min')) || 1;
        const maxVal = parseInt(qtyInput.getAttribute('max')) || 999;
        
        if (btnMinus) {
            btnMinus.addEventListener('click', () => {
                let currentVal = parseInt(qtyInput.value) || 1;
                if (currentVal > minVal) {
                    qtyInput.value = currentVal - 1;
                }
            });
        }
        
        if (btnPlus) {
            btnPlus.addEventListener('click', () => {
                let currentVal = parseInt(qtyInput.value) || 1;
                if (currentVal < maxVal) {
                    qtyInput.value = currentVal + 1;
                }
            });
        }
        
        // Enforce validation on key inputs
        qtyInput.addEventListener('change', () => {
            let currentVal = parseInt(qtyInput.value);
            if (isNaN(currentVal) || currentVal < minVal) {
                qtyInput.value = minVal;
            } else if (currentVal > maxVal) {
                qtyInput.value = maxVal;
            }
        });
    }
});
