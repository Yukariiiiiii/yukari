// ============================
// Theme Toggle
// ============================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

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
    navbar.style.boxShadow = window.scrollY > 50 ? 'var(--shadow-sm)' : 'none';
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
        if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
});

// ============================
// Intersection Observer - Fade In
// ============================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

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
        const increment = target / 125;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            stat.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
}

const statsSection = document.querySelector('.stats');
if (statsSection) {
    new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) animateStats(); });
    }, { threshold: 0.5 }).observe(statsSection);
}

// ============================
// Skill Progress Bars
// ============================
const skillItems = document.querySelectorAll('.skill-item');
const skillsSection = document.getElementById('skills');

if (skillsSection) {
    let skillsObserver;
    skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillItems.forEach((item, index) => {
                    const progress = item.querySelector('.skill-progress');
                    setTimeout(() => { progress.style.width = progress.style.getPropertyValue('--level'); }, index * 150);
                });
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
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> 发送成功!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; btn.style.background = ''; contactForm.reset(); }, 3000);
    }, 1500);
});

// ============================
// Smooth Scroll
// ============================
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

// ============================
// Parallax Effect
// ============================
const shapes = document.querySelectorAll('.shape');
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    shapes.forEach((shape, index) => {
        shape.style.transform = `translate(${x * (index + 1) * 0.5}px, ${y * (index + 1) * 0.5}px)`;
    });
});

// ============================
// Typing Effect
// ============================
const gradientText = document.querySelector('.gradient-text');
if (gradientText) {
    const text = gradientText.textContent;
    gradientText.textContent = '';
    let ci = 0;
    function typeChar() {
        if (ci < text.length) { gradientText.textContent += text.charAt(ci++); setTimeout(typeChar, 100); }
    }
    window.addEventListener('load', () => setTimeout(typeChar, 500));
}
