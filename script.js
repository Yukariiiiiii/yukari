// ============================
// Theme Toggle
// ============================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

// Check saved theme or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else if (systemPrefersLight) {
    htmlElement.setAttribute('data-theme', 'light');
}

updateThemeIcon();

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
});

function updateThemeIcon() {
    const theme = htmlElement.getAttribute('data-theme');
    if (theme === 'light') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// ============================
// Mobile Menu
// ============================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
    });
});

// ============================
// Navbar Scroll Effect
// ============================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = 'var(--shadow-sm)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// ============================
// Active Nav Link on Scroll
// ============================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ============================
// Intersection Observer - Fade In
// ============================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in to elements
document.querySelectorAll('.about-card, .article-card, .project-card, .skill-category, .contact-card').forEach((el, index) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(el);
});

// ============================
// Stats Counter Animation
// ============================
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
}

// Observe stats section
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
            }
        });
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
}

// ============================
// Skill Progress Bars
// ============================
const skillItems = document.querySelectorAll('.skill-item');

function animateSkills() {
    skillItems.forEach((item, index) => {
        const progress = item.querySelector('.skill-progress');
        const level = progress.style.getPropertyValue('--level');
        setTimeout(() => {
            progress.style.width = level;
        }, index * 150);
    });
}

// Observe skills section
const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkills();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    skillsObserver.observe(skillsSection);
}

// ============================
// Contact Form
// ============================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Simulate sending
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> 发送成功!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
            contactForm.reset();
        }, 3000);
    }, 1500);
});

// ============================
// Smooth Scroll for Hero Scroll Indicator
// ============================
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

// ============================
// Parallax Effect for Shapes
// ============================
const shapes = document.querySelectorAll('.shape');

window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    shapes.forEach((shape, index) => {
        const factor = (index + 1) * 0.5;
        shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});

// ============================
// Typing Effect for Hero Title (Optional Enhancement)
// ============================
const gradientText = document.querySelector('.gradient-text');
if (gradientText) {
    const text = gradientText.textContent;
    gradientText.textContent = '';
    let charIndex = 0;

    function typeChar() {
        if (charIndex < text.length) {
            gradientText.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeChar, 100);
        }
    }

    // Start typing after page load
    window.addEventListener('load', () => {
        setTimeout(typeChar, 500);
    });
}

// ============================
// Music Player (MetingJS + APlayer)
// ============================
(function () {
    const musicToggle = document.getElementById('musicToggle');
    const musicPlayer = document.getElementById('musicPlayer');
    const musicClose = document.getElementById('musicClose');
    const musicConfigBtn = document.getElementById('musicConfigBtn');
    const musicConfigPanel = document.getElementById('musicConfigPanel');
    const configServer = document.getElementById('configServer');
    const configType = document.getElementById('configType');
    const configId = document.getElementById('configId');
    const configApi = document.getElementById('configApi');
    const configApply = document.getElementById('configApply');
    const aplayerContainer = document.getElementById('aplayerContainer');
    const quickTags = document.querySelectorAll('.quick-tag');
    const musicLoading = document.getElementById('musicLoading');
    const musicError = document.getElementById('musicError');

    // 从 localStorage 读取保存的配置
    const saved = localStorage.getItem('musicConfig');
    let currentConfig = saved ? JSON.parse(saved) : {
        server: 'netease',
        type: 'playlist',
        id: '7627381372',
        api: 'https://meting.imsyy.top/api'
    };

    // 初始化表单值
    configServer.value = currentConfig.server;
    configType.value = currentConfig.type;
    configId.value = currentConfig.id;
    configApi.value = currentConfig.api;

    // 打开/关闭播放器
    musicToggle.addEventListener('click', () => {
        musicPlayer.classList.toggle('active');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    });

    musicClose.addEventListener('click', () => {
        musicPlayer.classList.remove('active');
    });

    // 配置面板
    musicConfigBtn.addEventListener('click', () => {
        musicConfigPanel.classList.toggle('open');
    });

    // 保存配置到 localStorage
    function saveConfig() {
        localStorage.setItem('musicConfig', JSON.stringify(currentConfig));
    }

    // 应用配置
    configApply.addEventListener('click', () => {
        const server = configServer.value;
        const type = configType.value;
        const id = configId.value.trim();
        const api = configApi.value.trim();

        if (!id) {
            showError('请输入歌单/专辑/歌曲 ID');
            return;
        }

        currentConfig = { server, type, id, api };
        saveConfig();
        rebuildMeting();
        musicConfigPanel.classList.remove('open');
        quickTags.forEach(tag => tag.classList.remove('active'));
    });

    // 快捷歌单
    quickTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const server = tag.dataset.server;
            const type = tag.dataset.type;
            const id = tag.dataset.id;

            configServer.value = server;
            configType.value = type;
            configId.value = id;
            currentConfig = { server, type, id, api: currentConfig.api };
            saveConfig();
            rebuildMeting();

            quickTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    // 显示错误
    function showError(msg) {
        musicError.querySelector('span').textContent = msg;
        musicError.classList.add('show');
        musicLoading.classList.remove('show');
        setTimeout(() => musicError.classList.remove('show'), 5000);
    }

    // 显示加载
    function showLoading() {
        musicLoading.classList.add('show');
        musicError.classList.remove('show');
    }

    // 隐藏加载
    function hideLoading() {
        musicLoading.classList.remove('show');
    }

    // 重建 MetingJS 组件
    function rebuildMeting() {
        const { server, type, id, api } = currentConfig;
        showLoading();

        // 销毁旧 APlayer 实例
        if (window.aplayers && window.aplayers.length) {
            window.aplayers.forEach(p => {
                try { p.destroy(); } catch (e) {}
            });
            window.aplayers = [];
        }

        // 重建 meting-js 元素
        aplayerContainer.innerHTML = `
            <meting-js
              id="metingMain"
              server="${server}"
              type="${type}"
              mid="${id}"
              api="${api}"
              fixed="false"
              mini="false"
              autoplay="false"
              theme="#7c5cff"
              loop="all"
              order="random"
              preload="auto"
              volume="0.7"
              list-folded="false"
              list-max-height="200px"
              lrc-type="1"
            ></meting-js>
        `;

        // 通知 MetingJS 重新解析
        document.dispatchEvent(new CustomEvent('meting:reload'));
        if (window.MetingJSEvent) {
            window.MetingJSEvent.emit('reload');
        }

        setTimeout(() => {
            hideLoading();
            window.dispatchEvent(new Event('resize'));
        }, 1500);
    }

    // 等待 APlayer 就绪并绑定事件
    function bindAPlayer() {
        const check = setInterval(() => {
            if (window.aplayers && window.aplayers.length > 0) {
                clearInterval(check);
                const ap = window.aplayers[0];

                ap.on('play', () => musicToggle.classList.add('playing'));
                ap.on('pause', () => musicToggle.classList.remove('playing'));
                ap.on('error', () => {
                    console.warn('歌曲加载失败');
                    musicToggle.classList.remove('playing');
                });
                ap.on('loadstart', () => showLoading());
                ap.on('canplay', () => hideLoading());

                hideLoading();
            }
        }, 500);

        // 10秒超时
        setTimeout(() => {
            clearInterval(check);
            if (!window.aplayers || !window.aplayers.length) {
                showError('加载超时，请尝试切换API地址');
            }
        }, 10000);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindAPlayer);
    } else {
        bindAPlayer();
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (!musicPlayer.classList.contains('active')) return;
        if (!window.aplayers || !window.aplayers.length) return;
        const ap = window.aplayers[0];

        switch (e.key) {
            case ' ':
                e.preventDefault();
                ap.toggle();
                break;
            case 'ArrowRight':
                ap.skipForward();
                break;
            case 'ArrowLeft':
                ap.skipBack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                ap.volume(Math.min(1, ap.volume() + 0.1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                ap.volume(Math.max(0, ap.volume() - 0.1));
                break;
        }
    });
})();