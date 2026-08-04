/* ============================================
   Tawk.to Enhanced Configuration
   Property ID: 6a7221676677831d43f6c037
   Widget ID: 1jv6t4vgs
   API Key (Secure Mode): 3e4a97c698741711b5857e136e1f5ad3a5939d5b
   ============================================ */

var Tawk_API = Tawk_API || {};

/* ============================================
   1. Visitor Information Tracking
   ============================================ */

// Set visitor attributes when widget loads
Tawk_API.onLoad = function() {
    // Get current page info
    var pageUrl = window.location.href;
    var pagePath = window.location.pathname;
    var pageTitle = document.title;
    var pageLanguage = document.documentElement.lang || 'en';

    // Detect page type
    var pageType = 'Other';
    if (pagePath === '/' || pagePath === '/index.html' || pagePath.endsWith('index.html')) {
        pageType = 'Homepage';
    } else if (pagePath.includes('/tours/')) {
        pageType = 'Tour Detail';
    } else if (pagePath.includes('tours.html')) {
        pageType = 'Tours Listing';
    } else if (pagePath.includes('contact')) {
        pageType = 'Contact';
    } else if (pagePath.includes('about')) {
        pageType = 'About';
    } else if (pagePath.includes('faq')) {
        pageType = 'FAQ';
    }

    // Extract tour name if on tour detail page
    var tourName = '';
    var tourTitleEl = document.querySelector('.tour-hero h1, .tour-detail-hero h1, .hero h1');
    if (tourTitleEl) {
        tourName = tourTitleEl.textContent.trim();
    }

    // Detect device type
    var deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';

    // Detect referral source
    var referrer = document.referrer || 'Direct';
    if (referrer.includes('google')) referrer = 'Google';
    else if (referrer.includes('bing')) referrer = 'Bing';
    else if (referrer.includes('facebook') || referrer.includes('instagram')) referrer = 'Social Media';
    else if (referrer.includes('shanghawondertours')) referrer = 'Internal';

    // Set visitor attributes
    Tawk_API.setAttributes({
        'Page Type': pageType,
        'Current Page': pageTitle,
        'Page URL': pageUrl,
        'Language': pageLanguage,
        'Device': deviceType,
        'Traffic Source': referrer,
        'Tour Viewed': tourName || 'N/A',
        'Website': 'Shanghai Wonder Tours'
    }, function(error) {
        if (error) {
            console.log('Tawk.to setAttributes error:', error);
        }
    });

    // Add page view event
    Tawk_API.addEvent('page-view', {
        'page_type': pageType,
        'page_url': pageUrl,
        'page_title': pageTitle,
        'tour_name': tourName || 'N/A',
        'device': deviceType,
        'source': referrer
    }, function(error) {
        if (error) {
            console.log('Tawk.to addEvent error:', error);
        }
    });

    // If on tour detail page, add specific event
    if (pageType === 'Tour Detail' && tourName) {
        Tawk_API.addEvent('tour-detail-view', {
            'tour_name': tourName,
            'page_url': pageUrl
        });
    }

    console.log('Tawk.to: Visitor tracking initialized for', pageType);
};

/* ============================================
   2. Chat Lifecycle Callbacks
   ============================================ */

// When chat status changes (online/offline)
Tawk_API.onStatusChange = function(status) {
    console.log('Tawk.to: Agent status -', status);
    // 'online' or 'offline'
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_status_change', {
            'status': status
        });
    }
};

// When visitor maximizes the chat widget
Tawk_API.onChatMaximized = function() {
    console.log('Tawk.to: Chat widget maximized');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_chat_opened', {
            'page_path': window.location.pathname
        });
    }
    Tawk_API.addEvent('chat-widget-opened', {
        'page_url': window.location.href
    });
};

// When visitor minimizes the chat widget
Tawk_API.onChatMinimized = function() {
    console.log('Tawk.to: Chat widget minimized');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_chat_minimized', {
            'page_path': window.location.pathname
        });
    }
};

// When chat begins (visitor sends first message)
Tawk_API.onChatBegin = function() {
    console.log('Tawk.to: Chat began');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_chat_began', {
            'page_path': window.location.pathname
        });
    }
};

// When chat starts (agent responds)
Tawk_API.onChatStart = function() {
    console.log('Tawk.to: Chat started with agent');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_chat_started', {
            'page_path': window.location.pathname
        });
    }
};

// When chat ends
Tawk_API.onChatEnd = function() {
    console.log('Tawk.to: Chat ended');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_chat_ended', {
            'page_path': window.location.pathname
        });
    }
    Tawk_API.addEvent('chat-ended', {
        'page_url': window.location.href,
        'duration': Math.round((new Date() - Tawk_LoadStart) / 1000) + 's'
    });
};

// When visitor sends a message
Tawk_API.onChatMessageVisitor = function(message) {
    console.log('Tawk.to: Visitor sent message');
    if (typeof gtag === 'function') {
        gtag('event', 'tawk_visitor_message', {
            'page_path': window.location.pathname
        });
    }
};

// When agent sends a message
Tawk_API.onChatMessageAgent = function(message) {
    console.log('Tawk.to: Agent sent message');
};

// When unread message count changes
Tawk_API.onUnreadCountChanged = function(count) {
    console.log('Tawk.to: Unread messages -', count);
    if (count > 0) {
        if (typeof gtag === 'function') {
            gtag('event', 'tawk_unread_message', {
                'count': count
            });
        }
    }
};

/* ============================================
   3. Auto-popup Behavior
   ============================================ */

// Auto-show chat widget after 30 seconds on tour detail pages (desktop only)
Tawk_API.onLoad = (function(originalOnLoad) {
    return function() {
        // Call original onLoad
        if (originalOnLoad) originalOnLoad();

        // Auto-popup logic
        var pagePath = window.location.pathname;
        var isTourPage = pagePath.includes('/tours/');
        var isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

        if (isTourPage && !isMobile) {
            // Check if visitor hasn't interacted with chat before
            var hasSeenPopup = sessionStorage.getItem('tawk_auto_popup');
            if (!hasSeenPopup) {
                setTimeout(function() {
                    Tawk_API.maximize();
                    sessionStorage.setItem('tawk_auto_popup', 'true');
                    console.log('Tawk.to: Auto-popup triggered on tour page');
                }, 30000); // 30 seconds
            }
        }

        // Show greeting message on homepage after 45 seconds
        if ((pagePath === '/' || pagePath.includes('index.html')) && !isMobile) {
            var hasSeenGreeting = sessionStorage.getItem('tawk_greeting');
            if (!hasSeenGreeting) {
                setTimeout(function() {
                    Tawk_API.maximize();
                    sessionStorage.setItem('tawk_greeting', 'true');
                    console.log('Tawk.to: Greeting popup triggered on homepage');
                }, 45000); // 45 seconds
            }
        }
    };
})(Tawk_API.onLoad);

/* ============================================
   4. Custom Helper Functions
   ============================================ */

// Track booking button clicks
document.addEventListener('click', function(e) {
    var target = e.target.closest('a[href*="contact"], .btn-book, .book-tour-btn, .sidebar-cta a');
    if (target && typeof Tawk_API !== 'undefined' && Tawk_API.addEvent) {
        Tawk_API.addEvent('booking-intent', {
            'button_text': target.textContent.trim(),
            'page_url': window.location.href,
            'destination': target.href || 'N/A'
        });
        console.log('Tawk.to: Booking intent tracked');
    }
});

// Track PDF download clicks
document.addEventListener('click', function(e) {
    var target = e.target.closest('.download-pdf-btn, [onclick*="window.print"]');
    if (target && typeof Tawk_API !== 'undefined' && Tawk_API.addEvent) {
        Tawk_API.addEvent('pdf-download-clicked', {
            'page_url': window.location.href,
            'page_title': document.title
        });
        console.log('Tawk.to: PDF download tracked');
    }
});

// Track contact form interactions
document.addEventListener('submit', function(e) {
    if (e.target.matches('form') && typeof Tawk_API !== 'undefined' && Tawk_API.addEvent) {
        Tawk_API.addEvent('form-submitted', {
            'form_action': e.target.action || 'N/A',
            'page_url': window.location.href
        });
        console.log('Tawk.to: Form submission tracked');
    }
});

// Track WhatsApp/WeChat button clicks
document.addEventListener('click', function(e) {
    var target = e.target.closest('a[href*="wa.me"], a[href*="whatsapp"], a[href*="weixin"]');
    if (target && typeof Tawk_API !== 'undefined' && Tawk_API.addEvent) {
        Tawk_API.addEvent('contact-channel-clicked', {
            'channel': target.href.includes('wa.me') || target.href.includes('whatsapp') ? 'WhatsApp' : 'WeChat',
            'page_url': window.location.href
        });
        console.log('Tawk.to: Contact channel click tracked');
    }
});

console.log('Tawk.to: Enhanced configuration loaded');
