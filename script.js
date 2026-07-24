// ====================================================================
// Yukariの小站 - SPA 路由 + 主题切换 + 黑胶音乐播放器
// ====================================================================

// ========== SPA 路由系统 ==========
const appMain = document.getElementById('app-main');

// 缓存已加载的页面，避免重复请求
const pageCache = new Map();

// 当前是否在处理导航
let isNavigating = false;

// 初始化路由
function initRouter() {
    // 拦截所有带 data-link 属性的链接
    document.addEventListener('click', handleLinkClick);

    // 监听浏览器前进/后退
    window.addEventListener('popstate', handlePopState);

    // 如果是从子页面直接刷新，或首次进入子页面 URL，需要加载对应内容
    // 但由于我们是单页应用，默认加载首页即可
}

async function handleLinkClick(e) {
    const link = e.target.closest('[data-link]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // 跳过外部链接、锚点链接、mailto、target=_blank
    if (link.target === '_blank') return;
    if (href.startsWith('mailto:')) return;
    if (href.startsWith('http') || href.startsWith('//')) return;

    e.preventDefault();
    navigateTo(href);
}

async function navigateTo(url) {
    if (isNavigating) return;
    isNavigating = true;

    // 显示加载动画
    appMain.style.opacity = '0.4';

    try {
        let html;
        if (pageCache.has(url)) {
            html = pageCache.get(url);
        } else {
            const res = await fetch(url, { headers: { 'Accept': 'text/html' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            html = await res.text();
            pageCache.set(url, html);
        }

        // 解析 HTML，提取 <main> 内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');

        if (newMain) {
            // 替换主内容区
            appMain.innerHTML = newMain.innerHTML;

            // 更新页面标题
            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;

            // 更新导航高亮
            updateNavForUrl(url);

            // 绑定新页面中的事件
            bindArticlePageEvents();

            // 重新观察 fade-in 元素
            observeFadeElements();

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 更新 URL（不刷新页面）
            history.pushState({ url }, '', url);
        }
    } catch (err) {
        console.error('页面加载失败:', err);
        // 失败时回退到普通跳转
        window.location.href = url;
    } finally {
        appMain.style.opacity = '1';
        isNavigating = false;
    }
}

async function handlePopState(e) {
    // 浏览器前进/后退
    const url = location.pathname + location.search + location.hash;
    if (isNavigating) return;
    isNavigating = true;

    try {
        let html;
        if (pageCache.has(url)) {
            html = pageCache.get(url);
        } else {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            html = await res.text();
            pageCache.set(url, html);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');

        if (newMain) {
            appMain.innerHTML = newMain.innerHTML;
            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;
            updateNavForUrl(url);
            bindArticlePageEvents();
            observeFadeElements();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    } catch (err) {
        console.error('popstate 加载失败:', err);
        window.location.reload();
    } finally {
        isNavigating = false;
    }
}

function updateNavForUrl(url) {
    // 根据 URL 高亮对应导航项
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    if (url.includes('articles/')) {
        // 文章子页面，高亮"文章"
        const articlesLink = document.querySelector('.nav-link[data-nav="articles"]');
        if (articlesLink) articlesLink.classList.add('active');
    } else {
        // 首页，高亮"首页"
        const homeLink = document.querySelector('.nav-link[data-nav="home"]');
        if (homeLink) homeLink.classList.add('active');
    }
}

function bindArticlePageEvents() {
    // 为文章子页面中的"返回"链接绑定 SPA 导航
    const backLinks = appMain.querySelectorAll('[data-link]');
    // 事件委托已处理，无需额外绑定

    // 文章页内的其他交互（如有）
}

function observeFadeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    appMain.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ========== 主题切换 ==========
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.body.classList.add('theme-transition');
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeToggle.title = '切换到浅色模式';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeToggle.title = '切换到深色模式';
    }
}

// ========== 移动端菜单 ==========
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== 导航高亮（首页内锚点） ==========
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

function highlightNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}
window.addEventListener('scroll', highlightNav);

// ========== 滚动入场动画（首页初始化） ==========
const homeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            homeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in').forEach(el => {
    homeObserver.observe(el);
});

// ========== 页面加载动画 ==========
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
});

// ========== 平滑滚动（首页锚点） ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== 鼠标跟随光晕效果 ==========
const orbs = document.querySelectorAll('.orb');
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        const moveX = (x - 0.5) * 30 * speed;
        const moveY = (y - 0.5) * 30 * speed;
        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ========== 文章卡片视差效果 ==========
function bindCardParallax() {
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
bindCardParallax();

// ====================================================================
// ========== 🎵 黑胶音乐播放器 ==========
// ====================================================================

const playlist = [
    {
        name: 'Sunny Morning',
        artist: 'Keys of Moon',
        src: 'https://cdn.pixabay.com/audio/2022/10/30/audio_347aa9b2a5.mp3',
        duration: '2:45',
        icon: '🎸'
    },
    {
        name: 'Acoustic Breeze',
        artist: 'Benjamin Tissot',
        src: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        duration: '3:12',
        icon: '🎵'
    },
    {
        name: 'Creative Minds',
        artist: 'Benjamin Tissot',
        src: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8e9bb2f65.mp3',
        duration: '3:30',
        icon: '🎹'
    },
    {
        name: 'Deep Relaxation',
        artist: 'Keys of Moon',
        src: 'https://cdn.pixabay.com/audio/2024/02/21/audio_91c69f1d10.mp3',
        duration: '4:05',
        icon: '🎻'
    },
    {
        name: 'Jazz Loop',
        artist: 'Free Music',
        src: 'https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3',
        duration: '2:58',
        icon: '🎷'
    },
    {
        name: 'Lo-fi Study Beats',
        artist: 'Chillhop',
        src: 'https://cdn.pixabay.com/audio/2023/03/30/audio_6f8c4c6b2e.mp3',
        duration: '3:45',
        icon: '🎧'
    }
];

// DOM 元素（这些始终存在于首页 DOM 中，不会被 SPA 切换销毁）
const audio = document.getElementById('audioElement');
const musicToggle = document.getElementById('musicToggle');
const vinylPlayer = document.getElementById('vinylPlayer');
const playerClose = document.getElementById('playerClose');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const miniPlay = document.getElementById('miniPlay');
const miniPlayIcon = document.getElementById('miniPlayIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const miniPrev = document.getElementById('miniPrev');
const miniNext = document.getElementById('miniNext');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const miniTrack = document.getElementById('miniTrack');
const miniArtist = document.getElementById('miniArtist');
const vinylLabel = document.getElementById('vinylLabel');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');
const volumeIcon = document.getElementById('volumeIcon');
const playlistEl = document.getElementById('playlist');
const playlistToggle = document.getElementById('playlistToggle');
const playlistChevron = document.getElementById('playlistChevron');
const miniPlayer = document.getElementById('miniPlayer');

// 播放器状态
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0;

// 初始化
function initPlayer() {
    audio.volume = 0.7;
    renderPlaylist();
    loadTrack(currentIndex);
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleAudioError);
}

function renderPlaylist() {
    playlistEl.innerHTML = playlist.map((track, index) => `
        <div class="playlist-item ${index === currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="item-icon">${track.icon}</div>
            <div class="item-info">
                <div class="item-name">${track.name}</div>
                <div class="item-artist">${track.artist}</div>
            </div>
            <div class="item-duration">${track.duration}</div>
        </div>
    `).join('');

    playlistEl.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            loadTrack(idx);
            playTrack();
        });
    });
}

function loadTrack(index) {
    currentIndex = index;
    const track = playlist[index];
    audio.src = track.src;
    trackName.textContent = track.name;
    trackArtist.textContent = track.artist;
    miniTrack.textContent = track.name;
    miniArtist.textContent = track.artist;
    vinylLabel.textContent = track.icon;

    playlistEl.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        updatePlayIcons();
        vinylPlayer.classList.add('playing');
        musicToggle.classList.add('playing');
        miniPlayer.classList.add('playing');
        miniPlayer.classList.add('show');
    }).catch(err => {
        console.warn('播放失败:', err.message);
        isPlaying = false;
        updatePlayIcons();
    });
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayIcons();
    vinylPlayer.classList.remove('playing');
    musicToggle.classList.remove('playing');
    miniPlayer.classList.remove('playing');
}

function togglePlay() {
    if (isPlaying) pauseTrack();
    else playTrack();
}

function updatePlayIcons() {
    const icon = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    playIcon.className = icon;
    miniPlayIcon.className = icon;
    if (isPlaying) playBtn.classList.add('playing');
    else playBtn.classList.remove('playing');
}

function prevTrack() {
    let idx = isShuffle ? Math.floor(Math.random() * playlist.length)
                        : (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(idx);
    if (isPlaying) playTrack();
}

function nextTrack() {
    let idx = isShuffle ? Math.floor(Math.random() * playlist.length)
                        : (currentIndex + 1) % playlist.length;
    loadTrack(idx);
    if (isPlaying) playTrack();
}

function handleTrackEnd() {
    if (repeatMode === 2) {
        audio.currentTime = 0;
        playTrack();
    } else if (repeatMode === 1) {
        nextTrack();
    } else {
        if (currentIndex < playlist.length - 1) nextTrack();
        else { pauseTrack(); audio.currentTime = 0; }
    }
}

function handleAudioError() {
    console.warn('音频加载失败，尝试下一首...');
    if (currentIndex < playlist.length - 1) setTimeout(() => nextTrack(), 1000);
}

function updateProgress() {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

progressBar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    audio.volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    volumeFill.style.width = `${audio.volume * 100}%`;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    const v = audio.volume;
    volumeIcon.className = v === 0 ? 'fas fa-volume-mute'
                          : v < 0.5 ? 'fas fa-volume-down'
                          : 'fas fa-volume-up';
}

volumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.dataset.lastVolume = audio.volume;
        audio.volume = 0;
        volumeFill.style.width = '0%';
    } else {
        audio.volume = parseFloat(audio.dataset.lastVolume) || 0.7;
        volumeFill.style.width = `${audio.volume * 100}%`;
    }
    updateVolumeIcon();
});

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.remove('active');
    switch (repeatMode) {
        case 0:
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            break;
        case 1:
            repeatBtn.innerHTML = '<i class="fas fa-redo" style="color: var(--accent)"></i>';
            repeatBtn.classList.add('active');
            break;
        case 2:
            repeatBtn.style.position = 'relative';
            repeatBtn.innerHTML = '<i class="fas fa-redo" style="color: var(--accent)"></i><span style="position:absolute;font-size:0.55rem;top:2px;right:4px;color:var(--accent);font-weight:700;">1</span>';
            repeatBtn.classList.add('active');
            break;
    }
});

musicToggle.addEventListener('click', () => {
    vinylPlayer.classList.toggle('open');
});

playerClose.addEventListener('click', () => {
    vinylPlayer.classList.remove('open');
});

playlistToggle.addEventListener('click', () => {
    playlistEl.classList.toggle('open');
    playlistToggle.classList.toggle('open');
});

playBtn.addEventListener('click', togglePlay);
miniPlay.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
miniPrev.addEventListener('click', prevTrack);
miniNext.addEventListener('click', nextTrack);

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': nextTrack(); break;
        case 'ArrowLeft': prevTrack(); break;
        case 'ArrowUp':
            e.preventDefault();
            audio.volume = Math.min(1, audio.volume + 0.1);
            volumeFill.style.width = `${audio.volume * 100}%`;
            updateVolumeIcon();
            break;
        case 'ArrowDown':
            e.preventDefault();
            audio.volume = Math.max(0, audio.volume - 0.1);
            volumeFill.style.width = `${audio.volume * 100}%`;
            updateVolumeIcon();
            break;
        case 'm': volumeIcon.click(); break;
    }
});

// 初始化
initRouter();
initPlayer();

// 首次提示
setTimeout(() => {
    if (!isPlaying) miniPlayer.classList.add('show');
}, 3000);
