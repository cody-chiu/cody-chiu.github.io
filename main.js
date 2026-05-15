// 確保 DOM 載入後才執行
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Menu 邏輯 ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        if (!menuBtn || !mobileMenu) return;
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));


    // --- 2. Menu Highlight 邏輯 (修正 About 重疊問題) ---
    const navLinks = document.querySelectorAll('.nav-link');

    function updateScroll() {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.documentElement.scrollHeight;

        const isBottom = (scrollPos + windowHeight) >= bodyHeight - 100;

        const sections = Array.from(navLinks).map(link => {
            const href = link.getAttribute('href');
            let id = href.includes('#') ? href.split('#').pop() : (href.endsWith('.html') ? href.replace('.html', '') : null);
            if (href.includes('portfolio') && document.getElementById('portfolio')) {
                id = 'portfolio';
            }
            const element = id ? document.getElementById(id) : null;
            return {
                id,
                element,
                link
            };
        }).filter(item => item.element !== null);

        let activeId = null;

        if (isBottom && sections.length > 0) {
            activeId = sections[sections.length - 1].id;
        } else {
            // 改用反向尋找，解決 About/Experience 重疊問題
            for (let i = sections.length - 1; i >= 0; i--) {
                // 增加到 100px 容錯，讓 About 這種短區塊更容易被偵測
                if (scrollPos >= sections[i].element.offsetTop - 100) {
                    activeId = sections[i].id;
                    break;
                }
            }
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('text-primary');
            link.classList.add('text-secondary');

            if (activeId && (href.endsWith(`#${activeId}`) || href.includes(`${activeId}.html`) || (activeId === 'portfolio' && href.includes('portfolio')))) {
                link.classList.add('text-primary');
                link.classList.remove('text-secondary');
            }
        });
    }

    window.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);
    updateScroll();

    // --- 3. GA4 Section Engagement Tracking ---
    const analyticsSections = document.querySelectorAll('main > section[id]');
    let activeSection = null;
    let activeSectionStart = 0;

    function sendAnalyticsEvent(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params);
    }

    function getSectionLabel(section) {
        const heading = section.querySelector('h1, h2, h3');
        return heading ? heading.textContent.trim().replace(/\s+/g, ' ') : section.id;
    }

    function closeActiveSection() {
        if (!activeSection || !activeSectionStart) return;
        const engagementSeconds = Math.round((Date.now() - activeSectionStart) / 1000);
        if (engagementSeconds >= 2) {
            sendAnalyticsEvent('section_engagement', {
                section_id: activeSection.id,
                section_label: getSectionLabel(activeSection),
                engagement_seconds: engagementSeconds,
                page_path: window.location.pathname
            });
        }
        activeSection = null;
        activeSectionStart = 0;
    }

    if (analyticsSections.length > 0) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visibleEntry = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visibleEntry || visibleEntry.target === activeSection) return;

            closeActiveSection();
            activeSection = visibleEntry.target;
            activeSectionStart = Date.now();
            sendAnalyticsEvent('section_view', {
                section_id: activeSection.id,
                section_label: getSectionLabel(activeSection),
                page_path: window.location.pathname
            });
        }, {
            threshold: [0.5, 0.75]
        });

        analyticsSections.forEach(section => sectionObserver.observe(section));
        window.addEventListener('pagehide', closeActiveSection);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') closeActiveSection();
        });
    }


    // --- 4. Copy Email 邏輯 (加入安全檢查) ---
    const copyBtn = document.getElementById('copy-link');
    if (copyBtn) {
        copyBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const email = "lililala7766@gmail.com";
            const text = document.getElementById('email-text');
            const icon = document.getElementById('copy-icon');

            navigator.clipboard.writeText(email).then(() => {
                if (text) text.classList.replace('text-secondary', 'text-primary');
                if (icon) icon.classList.replace('text-secondary', 'text-primary');

                setTimeout(() => {
                    if (text) text.classList.replace('text-primary', 'text-secondary');
                    if (icon) icon.classList.replace('text-primary', 'text-secondary');
                }, 1000); // 延長到 1 秒比較好察覺
            });
        });
    }
});

// 監聽全域點擊
document.addEventListener('click', (e) => {
    // 找出所有處於 active 狀態的卡片
    const activeCards = document.querySelectorAll('.is-active');
    activeCards.forEach(card => {
        // 如果點擊的目標不是卡片本身，就移除 active 狀態
        if (!card.contains(e.target)) {
            card.classList.remove('is-active');
        }
    });
});
