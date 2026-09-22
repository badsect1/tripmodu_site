document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form submission handler with EmailJS
    const form = document.querySelector('.inquiry-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = '전송 중...';
            submitBtn.disabled = true;

            // Prepare template parameters
            // Note: These parameter names must match the variables in your EmailJS template
            const templateParams = {
                org_name: document.getElementById('org-name').value,
                contact_name: document.getElementById('contact-name').value,
                phone: document.getElementById('phone').value,
                type: document.getElementById('type').value,
                message: document.getElementById('message').value
            };

            emailjs.send('service_h6aahsj', 'template_2fj3g5s', templateParams)
                .then(() => {
                    alert('문의가 성공적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.');
                    form.reset();
                }, (error) => {
                    console.error('FAILED...', error);
                    alert('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.\n에러: ' + JSON.stringify(error));
                })
                .finally(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Navbar scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
    });
});
