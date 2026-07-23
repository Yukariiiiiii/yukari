// ============================
// MyGO!!!!! Blog — Interactions
// "迷子でもいい、前へ進め"
// ============================

// ============================
// Theme Toggle (世界線切り替え)
// ============================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('mygo-theme');
const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
if (savedTheme) htmlElement.setAttribute('data-theme', savedTheme);
else if (systemLight) htmlElement.setAttribute('data-theme', 'light');

updateThemeIcon();
themeToggle.addEventListener('click', () => {
    const cur = htmlElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', next);
    localStorage.setItem('mygo-theme', next);
    updateThemeIcon();
});

function updateThemeIcon() {
    const t = htmlElement.getAttribute('data-theme');
    themeIcon.className = t === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ============================
// Mobile Menu
// ============================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.querySelector('i').className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
    });
});

// ============================
// Navbar Scroll & Active Link
// ============================
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 50 ? '0 2px 16px rgba(51,136,187,0.15)' : 'none';
    let current = '';
    const scrollY = window.scrollY + 120;
    sections.forEach(s => {
        if (scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight) {
            current = s.getAttribute('id');
        }
    });
    navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
});

// ============================
// Fade In Observer
// ============================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.about-card, .article-card, .lyric-card, .skill-category, .contact-card, .link-card').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${Math.min(i * 0.08, 0.6)}s`;
    observer.observe(el);
});

// ============================
// Stats Counter
// ============================
const statNumbers = document.querySelectorAll('.stat-number');
let statsDone = false;
function animateStats() {
    if (statsDone) return;
    statsDone = true;
    statNumbers.forEach(s => {
        const target = +s.getAttribute('data-target');
        const dur = 1500, fps = 60, total = dur / 1000 * fps, inc = target / total;
        let cur = 0;
        const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) { cur = target; clearInterval(timer); }
            s.textContent = Math.floor(cur).toLocaleString();
        }, 1000 / fps);
    });
}
const statsSection = document.querySelector('.stats');
if (statsSection) new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && animateStats()), { threshold: 0.4 }).observe(statsSection);

// ============================
// Skill Bars
// ============================
const skillItems = document.querySelectorAll('.skill-item');
const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const obs = new IntersectionObserver((es) => {
        es.forEach(e => {
            if (e.isIntersecting) {
                skillItems.forEach((item, i) => {
                    setTimeout(() => {
                        item.querySelector('.skill-progress').style.width = item.querySelector('.skill-progress').style.getPropertyValue('--level');
                    }, i * 120);
                });
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    obs.observe(skillsSection);
}

// ============================
// Vinyl Record — Pause on scroll away
// ============================
const vinyl = document.getElementById('vinylRecord');
let vinylObserver = new IntersectionObserver((es) => {
    es.forEach(e => {
        if (vinyl) vinyl.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    });
}, { threshold: 0.3 });
if (vinyl) vinylObserver.observe(vinyl);

// ============================
// Starry Background (Canvas)
// ============================
(function starryBg() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:0.6';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.min(Math.floor(w * h / 8000), 200);
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random() * 0.5 + 0.2,
            speed: Math.random() * 0.3 + 0.05,
            twinkle: Math.random() * Math.PI * 2
        }));
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        ctx.clearRect(0, 0, w, h);
        stars.forEach(s => {
            s.twinkle += 0.02;
            const alpha = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,220,255,${alpha})`;
            ctx.fill();
            // 大星加十字光芒
            if (s.r > 1.2) {
                ctx.strokeStyle = `rgba(180,220,255,${alpha * 0.5})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3); ctx.stroke();
            }
        });
        requestAnimationFrame(draw);
    }
    draw();

    // 鼠标视差
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('mousemove', e => { tmx = (e.clientX / w - 0.5) * 20; tmy = (e.clientY / h - 0.5) * 20; });
    function parallax() {
        mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
        canvas.style.transform = `translate(${mx}px, ${my}px)`;
        requestAnimationFrame(parallax);
    }
    parallax();
})();

// ============================
// Contact Form
// ============================
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> 届きました！';
        btn.style.background = 'linear-gradient(135deg, #00D4AA, #5EF0C8)';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; contactForm.reset(); }, 3000);
    }, 1500);
});

// ============================
// Smooth Scroll
// ============================
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

// ============================
// Hero Parallax (shapes)
// ============================
const heroVisual = document.querySelector('.hero-visual');
window.addEventListener('mousemove', (e) => {
    if (!heroVisual) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 16;
    heroVisual.style.transform = `translate(${x}px, ${y}px)`;
});

// ============================
// Typing Effect on Hero Subtitle
// ============================
const heroSub = document.querySelector('.hero-subtitle');
if (heroSub) {
    const text = heroSub.innerHTML;
    heroSub.innerHTML = '';
    let i = 0, typing = true;
    function typeWriter() {
        if (i <= text.length && typing) {
            heroSub.innerHTML = text.slice(0, i) + '<span style="opacity:0.5">|</span>';
            i++; setTimeout(typeWriter, 30);
        } else { typing = false; heroSub.innerHTML = text; }
    }
    window.addEventListener('load', () => setTimeout(typeWriter, 800));
}
