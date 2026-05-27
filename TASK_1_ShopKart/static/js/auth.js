document.addEventListener('DOMContentLoaded', () => {
    // 1. Password Visibility Toggle
    const toggleBtns = document.querySelectorAll('.password-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    btn.textContent = 'Hide';
                } else {
                    targetInput.type = 'password';
                    btn.textContent = 'Show';
                }
            }
        });
    });

    // 2. Password Strength Meter & Matching Validation
    const pwdInput = document.getElementById('id_password');
    const confirmInput = document.getElementById('id_confirm_password');
    const pwdMeter = document.querySelector('.pwd-meter-bar');
    const matchFeedback = document.getElementById('password-match-feedback');

    if (pwdInput) {
        pwdInput.addEventListener('input', () => {
            const val = pwdInput.value;
            let score = 0;
            
            if (val.length >= 8) score += 25;
            if (/[A-Z]/.test(val)) score += 25;
            if (/[0-9]/.test(val)) score += 25;
            if (/[^A-Za-z0-9]/.test(val)) score += 25;
            
            if (pwdMeter) {
                pwdMeter.style.width = `${score}%`;
                
                // Colorize based on score
                if (score <= 25) {
                    pwdMeter.style.backgroundColor = '#e74c3c'; // Weak (Red)
                } else if (score <= 75) {
                    pwdMeter.style.backgroundColor = '#f1c40f'; // Moderate (Yellow)
                } else {
                    pwdMeter.style.backgroundColor = '#2ecc71'; // Strong (Green)
                }
            }
        });
    }

    if (pwdInput && confirmInput && matchFeedback) {
        const validateMatch = () => {
            const p = pwdInput.value;
            const cp = confirmInput.value;
            
            if (cp === '') {
                matchFeedback.textContent = '';
                confirmInput.style.borderColor = '';
            } else if (p === cp) {
                matchFeedback.textContent = 'Passwords match';
                matchFeedback.style.color = '#2ecc71';
                confirmInput.style.borderColor = '#2ecc71';
            } else {
                matchFeedback.textContent = 'Passwords do not match';
                matchFeedback.style.color = '#e74c3c';
                confirmInput.style.borderColor = '#e74c3c';
            }
        };

        pwdInput.addEventListener('input', validateMatch);
        confirmInput.addEventListener('input', validateMatch);
    }
});
