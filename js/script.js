/* ============================================
   Shanghai Tours - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // --- Language Switcher (i18n) ---
    let currentLang = localStorage.getItem('shanghai_tours_lang') || 'en';

    function t(key) {
        return i18n[currentLang] && i18n[currentLang][key] !== undefined ? i18n[currentLang][key] : i18n['en'][key] || key;
    }

    function applyTranslations() {
        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translation = t(key);
            if (translation) {
                el.innerHTML = translation;
            }
        });

        // Update lang switcher button text
        const langCurrent = document.querySelector('.lang-current');
        if (langCurrent) {
            langCurrent.textContent = currentLang === 'zh' ? '中' : 'EN';
        }

        // Update HTML lang attribute
        document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    }

    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) {
        langSwitcher.addEventListener('click', function() {
            currentLang = currentLang === 'en' ? 'zh' : 'en';
            localStorage.setItem('shanghai_tours_lang', currentLang);
            applyTranslations();
        });
    }

    // Apply initial translations
    applyTranslations();

    // --- Search Overlay ---
    const searchData = [
        { title: 'Shanghai Classic Full-Day Tour', desc: 'The Bund, Yu Garden, Shanghai Tower, French Concession & Huangpu River cruise', icon: '🏛️', price: '$89', url: 'tours/classic-tour.html' },
        { title: 'Shanghai Street Food & Night Market', desc: 'Xiaolongbao, shengjian, noodles, night market exploration', icon: '🍜', price: '$65', url: 'tours/food-tour.html' },
        { title: 'Zhujiajiao Water Town & Tea Ceremony', desc: 'Ancient canals, gondola ride, tea ceremony, Ming garden', icon: '🚣', price: '$75', url: 'tours/water-town-tour.html' },
        { title: 'Night Skyline & River Cruise', desc: 'Huangpu River night cruise, Bund illumination, Pudong skyline', icon: '🌃', price: '$55', url: 'tours/night-tour.html' },
        { title: 'Cultural Deep Dive', desc: 'Jade Buddha Temple, Shanghai Museum, silk, tea ceremony, calligraphy', icon: '🏯', price: '$79', url: 'tours/cultural-tour.html' },
    ];

    const searchDataZh = [
        { title: '上海经典一日游', desc: '外滩、豫园、上海中心大厦、法租界、黄浦江游船', icon: '🏛️', price: '$89', url: 'tours/classic-tour.html' },
        { title: '上海街头美食夜市游', desc: '小笼包、生煎、面条、夜市探索', icon: '🍜', price: '$65', url: 'tours/food-tour.html' },
        { title: '朱家角水乡与茶道体验', desc: '古运河、乌篷船、茶道、明代园林', icon: '🚣', price: '$75', url: 'tours/water-town-tour.html' },
        { title: '上海夜景天际线与浦江夜游', desc: '黄浦江夜游、外滩灯光、浦东天际线', icon: '🌃', price: '$55', url: 'tours/night-tour.html' },
        { title: '文化深度游', desc: '玉佛寺、上海博物馆、丝绸、茶道、书法', icon: '🏯', price: '$79', url: 'tours/cultural-tour.html' },
    ];

    // Create search overlay HTML
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.id = 'searchOverlay';
    searchOverlay.innerHTML = `
        <button class="search-overlay-close" id="searchClose" aria-label="Close search">
            <i class="fas fa-times"></i>
        </button>
        <input type="text" class="search-overlay-input" id="searchInput"
               placeholder="${t('search.placeholder')}" autocomplete="off">
        <p class="search-overlay-hint">${currentLang === 'zh' ? '输入关键词搜索旅游路线...' : 'Type to search tours, attractions, and more...'}</p>
        <div class="search-overlay-results" id="searchResults"></div>
    `;
    document.body.appendChild(searchOverlay);

    function performSearch(query) {
        const results = document.getElementById('searchResults');
        const data = currentLang === 'zh' ? searchDataZh : searchData;

        if (!query.trim()) {
            results.innerHTML = '';
            return;
        }

        const q = query.toLowerCase();
        const filtered = data.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            results.innerHTML = `<div class="search-no-results">${t('search.no_results')}</div>`;
            return;
        }

        results.innerHTML = filtered.map(item => `
            <a href="${item.url}" class="search-result-item" onclick="closeSearch()">
                <span class="search-result-icon">${item.icon}</span>
                <div class="search-result-info">
                    <span class="search-result-title">${item.title}</span>
                    <span class="search-result-desc">${item.desc}</span>
                </div>
                <span class="search-result-price">${item.price}</span>
            </a>
        `).join('');
    }

    function openSearch() {
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 100);
    }

    window.closeSearch = function() {
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    };

    // Search trigger button
    const searchBtn = document.createElement('button');
    searchBtn.className = 'search-trigger';
    searchBtn.id = 'searchTrigger';
    searchBtn.setAttribute('aria-label', 'Search');
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';

    // Insert search button after lang switcher
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        const langSwitcherBtn = document.getElementById('langSwitcher');
        if (langSwitcherBtn) {
            langSwitcherBtn.after(searchBtn);
        } else {
            headerActions.insertBefore(searchBtn, headerActions.firstChild);
        }
    }

    document.getElementById('searchTrigger').addEventListener('click', openSearch);
    document.getElementById('searchClose').addEventListener('click', window.closeSearch);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.closeSearch();
        if (e.key === 'Enter') {
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) firstResult.click();
        }
    });

    // Close on overlay click (not on children)
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === this) window.closeSearch();
    });

    // Keyboard shortcut: Ctrl+K or Cmd+K
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

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

    // --- Contact Form (Formspree backend) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Set hidden replyTo field when email changes
        const emailInput = document.getElementById('email');
        const replyToInput = document.getElementById('formReplyTo');
        if (emailInput && replyToInput) {
            emailInput.addEventListener('change', function() {
                replyToInput.value = this.value;
            });
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = emailInput.value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields (Name, Email, and Message).');
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                alert('Please enter a valid email address.');
                return;
            }

            const btn = document.getElementById('formSubmitBtn');
            const originalHtml = btn.innerHTML;

            // Show loading state
            btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                btn.innerHTML = '✓ Inquiry Sent Successfully!';
                btn.style.background = '#27ae60';
                btn.style.borderColor = '#27ae60';
                contactForm.reset();
                if (replyToInput) replyToInput.value = '';

                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 4000);
            })
            .catch(error => {
                btn.innerHTML = '✗ Failed to send. Please try email.';
                btn.style.background = '#e74c3c';
                btn.style.borderColor = '#e74c3c';

                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 4000);
                console.error('Form error:', error);
            });
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