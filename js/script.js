/* ============================================
   Shanghai Tours - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // --- Header scroll effect ---
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // --- Mobile Menu ---
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });
    }

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // --- Hero Slider ---
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    function prevSlideFn() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    if (slides.length > 1) {
        startSlideShow();

        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                stopSlideShow();
                goToSlide(parseInt(this.dataset.slide));
                startSlideShow();
            });
        });

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', function() {
                stopSlideShow();
                prevSlideFn();
                startSlideShow();
            });
            nextBtn.addEventListener('click', function() {
                stopSlideShow();
                nextSlide();
                startSlideShow();
            });
        }

        // Pause on hover
        const slider = document.getElementById('heroSlider');
        if (slider) {
            slider.addEventListener('mouseenter', stopSlideShow);
            slider.addEventListener('mouseleave', startSlideShow);
        }
    }

    // --- Back to Top ---
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Tour Filter ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    const tourCards = document.querySelectorAll('.tour-detail-card[data-category]');

    if (filterTabs.length) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;

                tourCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'grid';
                        card.style.animation = 'fadeIn 0.4s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');
    const faqContents = document.querySelectorAll('.faq-category-content');

    // FAQ category tabs
    if (faqCategories.length) {
        faqCategories.forEach(cat => {
            cat.addEventListener('click', function() {
                faqCategories.forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                faqContents.forEach(c => c.classList.remove('active'));
                const target = document.getElementById('cat-' + this.dataset.category);
                if (target) target.classList.add('active');
            });
        });
    }

    // FAQ item toggle
    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');
                    // Close all items in this category
                    const parent = item.closest('.faq-category-content');
                    if (parent) {
                        parent.querySelectorAll('.faq-item').forEach(i => {
                            i.classList.remove('active');
                            const toggle = i.querySelector('.faq-toggle i');
                            if (toggle) toggle.className = 'fas fa-plus';
                        });
                    }
                    // Toggle current
                    if (!isActive) {
                        item.classList.add('active');
                        const toggle = item.querySelector('.faq-toggle i');
                        if (toggle) toggle.className = 'fas fa-minus';
                    }
                });
            }
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // --- Contact Form (simple validation & UI feedback) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields (Name, Email, and Message).');
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                alert('Please enter a valid email address.');
                return;
            }

            // Show success message (in production, this would send the form)
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Sent Successfully!';
            btn.style.background = '#27ae60';
            btn.style.borderColor = '#27ae60';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);

            // In production, you would send data to your backend here
            console.log('Form submitted:', { name, email, message });
        });
    }

    // --- Animate elements on scroll ---
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .tour-card, .testimonial-card, .value-card, .team-card');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 50;

            if (isVisible) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animation
    document.querySelectorAll('.feature-card, .tour-card, .testimonial-card, .value-card, .team-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load

    // --- Auto-select tour in contact form from URL params ---
    const urlParams = new URLSearchParams(window.location.search);
    const tourParam = urlParams.get('tour');
    if (tourParam) {
        const tourSelect = document.getElementById('tour');
        if (tourSelect) {
            for (let option of tourSelect.options) {
                if (option.value === tourParam) {
                    option.selected = true;
                    break;
                }
            }
        }
    }

    // Add keyframe animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);

});