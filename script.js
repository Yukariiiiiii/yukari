// ====================================================================
// Yukariの小站 - SPA 路由 + 主题切换 + 黑胶音乐播放器（侧边收起·方形UI）
// ====================================================================

// ========== SPA 路由系统 ==========
const appMain = document.getElementById('app-main');
const pageCache = new Map();
let isNavigating = false;

// 首页内容快照（用于返回首页时恢复，避免重新请求）
let homeSnapshot = null;

function initRouter() {
    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);

    // 启动时保存首页内容
    if (appMain) homeSnapshot = appMain.innerHTML;
}

async function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    // 必须带 data-link 属性才走 SPA
    if (!link.hasAttribute('data-link')) return;

    const href = link.getAttribute('href');
    if (!href) return;
    if (link.target === '_blank') return;
    if (href.startsWith('mailto:')) return;
    if (href.startsWith('http') || href.startsWith('//')) return;
    // 忽略纯锚点
    if (href.startsWith('#') && href.length > 1) {
        // 首页内的锚点仍用平滑滚动
        e.preventDefault();
        const t = document.querySelector(href); if (t) t.scrollIntoView({ behavior:'smooth' });
        return;
    }
    // 首页链接：href="/" 或 href=""
    if (href === '/' || href === '' || href === '#') {
        e.preventDefault();
        // 恢复首页内容
        if (homeSnapshot) {
            appMain.style.opacity = '0.4';
            appMain.innerHTML = homeSnapshot;
            updateNavForUrl('/');
            observeFadeElements();
            bindCardParallax();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState({ url: '/' }, '', '/');
            setTimeout(() => appMain.style.opacity = '1', 50);
        }
        return;
    }

    e.preventDefault();
    navigateTo(href);
}

async function navigateTo(url) {
    if (isNavigating) return;
    isNavigating = true;
    appMain.style.opacity = '0.4';
    try {
        let html = pageCache.get(url);
        if (!html) {
            const res = await fetch(url, { headers: { 'Accept': 'text/html' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            html = await res.text();
            pageCache.set(url, html);
        }
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');
        if (newMain) {
            appMain.innerHTML = newMain.innerHTML;
            const t = doc.querySelector('title'); if (t) document.title = t.textContent;
            updateNavForUrl(url);
            observeFadeElements();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState({ url }, '', url);
        }
    } catch (err) { console.error('页面加载失败:', err); window.location.href = url; }
    finally { appMain.style.opacity = '1'; isNavigating = false; }
}

async function handlePopState(e) {
    const url = location.pathname + location.search + location.hash;
    if (isNavigating) return;
    isNavigating = true;

    // 如果是首页，直接恢复快照
    if (url === '/' || url === '/' + location.search) {
        if (homeSnapshot) {
            appMain.innerHTML = homeSnapshot;
            updateNavForUrl('/');
            observeFadeElements();
            bindCardParallax();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
        isNavigating = false;
        return;
    }

    try {
        let html = pageCache.get(url);
        if (!html) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            html = await res.text();
            pageCache.set(url, html);
        }
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');
        if (newMain) {
            appMain.innerHTML = newMain.innerHTML;
            const t = doc.querySelector('title'); if (t) document.title = t.textContent;
            updateNavForUrl(url);
            observeFadeElements();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    } catch (err) { console.error('popstate 失败:', err); window.location.reload(); }
    finally { isNavigating = false; }
}

function updateNavForUrl(url) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (url.includes('articles/')) {
        const el = document.querySelector('.nav-link[data-nav="articles"]'); if (el) el.classList.add('active');
    } else {
        const el = document.querySelector('.nav-link[data-nav="home"]'); if (el) el.classList.add('active');
    }
}

function observeFadeElements() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    if (appMain) appMain.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ========== 主题切换 ==========
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);
if (themeIcon) updateThemeIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const cur = root.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.body.classList.add('theme-transition');
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        if (themeIcon) updateThemeIcon(next);
        setTimeout(() => document.body.classList.remove('theme-transition'), 500);
    });
}

function updateThemeIcon(theme) {
    if (!themeIcon) return;
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.title = theme === 'dark' ? '切换到浅色模式' : '切换到深色模式';
}

// ========== 移动端菜单 ==========
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));
}

// ========== 导航高亮（首页内锚点） ==========
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    if (location.pathname !== '/') return; // 只在首页生效
    const y = window.scrollY + 100;
    sections.forEach(s => {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
            navItems.forEach(i => i.classList.remove('active'));
            const a = document.querySelector(`.nav-link[href="#${s.id}"]`); if (a) a.classList.add('active');
        }
    });
});

// ========== 入场动画 ==========
const homeObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); homeObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-in').forEach(el => homeObs.observe(el));

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    setTimeout(() => document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('visible')), 100);
});

// ========== 平滑滚动 ==========
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const h = this.getAttribute('href'); if (h === '#' || h === '#home') return;
        e.preventDefault();
        const t = document.querySelector(h); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ========== 鼠标光晕 ==========
const orbs = document.querySelectorAll('.orb');
document.addEventListener('mousemove', e => {
    const x = e.clientX / window.innerWidth, y = e.clientY / window.innerHeight;
    orbs.forEach((o, i) => { const s = (i+1)*0.5; o.style.transform = `translate(${(x-0.5)*30*s}px, ${(y-0.5)*30*s}px)`; });
});

// ========== 卡片视差 ==========
function bindCardParallax() {
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const cx = r.width/2, cy = r.height/2;
            card.style.transform = `perspective(1000px) rotateX(${(y-cy)/20}deg) rotateY(${(cx-x)/20}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = '');
    });
}
bindCardParallax();

// ====================================================================
// ========== 🎵 音乐播放器 ==========
// ====================================================================

const playlist = [
    {
        name: 'だから僕は音楽を辞めた',
        artist: 'ヨルシカ',
        src: 'https://aqqmusic.tc.qq.com/M500002pVQc229dcjx.mp3?guid=1907128691&vkey=89C3DE068EB1A82551D31DB3225CE989B73328C74C3B24200105DE52690D65D0DB3106EB78008D009BDB536B197A40A3660A4169009AFDCE__v2ba82194&uin=&fromtag=120042',
        duration: '4:02',
        icon: '🎸'
    },
    {
        name: 'ただ君に晴れ',
        artist: 'ヨルシカ',
        src: 'https://aqqmusic.tc.qq.com/M500001fEMhM2U483n.mp3?guid=1360403577&vkey=9489CB23DA2A98D5B6080EDA692FC1E1DB29C18715CAC777762840A179B512A907B141D36520FF8BD8D68DEA3582ABA7CD6C14BF4A61A191__v2b9abe71&uin=&fromtag=120042',
        duration: '3:18',
        icon: '🎵'
    },
    {
        name: '花に亡霊',
        artist: 'ヨルシカ',
        src: 'https://isure6.stream.qqmusic.qq.com/M800002upFb81sU3lN.mp3?guid=cyapi&vkey=121FE7E2F80EAA3108F5603B94E0CA62A59029BF5D993C45F8928AAB41E944B07EA29BAF6525A54E5081692D209EB648F19B2504B611AF4D__v2b9ab542&uin=3319386682&fromtag=myhkw.cn&cache=0724164927',
        duration: '3:59',
        icon: '🎹'
    },
    {
        name: '言って。',
        artist: 'ヨルシカ',
        src: 'https://aqqmusic.tc.qq.com/M500002t3G7L1aKEMi.mp3?guid=600670738&vkey=F936F20BA51065A6F4753F516C8BF1A6B88D077E13FDE1E29CB7875AFCBEB61555CDBBF56634D5C1D48CA8921CF7160580DB3ABFC0D0B3F4__v2b9abe71&uin=&fromtag=120042',
        duration: '4:02',
        icon: '🎻'
    },
    {
        name: '老人と海',
        artist: 'ヨルシカ',
        src: 'https://isure6.stream.qqmusic.qq.com/M800003D7nyJ3FXunp.mp3?guid=cyapi&vkey=CABABFA44D7B760D1708F18597CB4C3D8532BE91D74157BE0A3458584DAC3CF4133E31E3E08757E62A83D6E2B12FB49C919788AD9805237C__v2b9ab541&uin=3248206813&fromtag=myhkw.cn&cache=0724165252',
        duration: '4:15',
        icon: '🎷'
    },
    {
        name: '千鳥',
        artist: 'ヨルシカ',
        src: 'https://isure6.stream.qqmusic.qq.com/M800001Kq5ft3NAF5M.mp3?guid=cyapi&vkey=AFCD8B67237713F9272FCC82C57733CC843354190069997BCCECF9EE56BB7B85C39E88CC169C7C9BEE86BF149743B91DC056DFDA8574138C__v2b9ab6a1&uin=3651897930&fromtag=myhkw.cn&cache=0724165401',
        duration: '4:12',
        icon: '🎧'
    }
];

// DOM 引用（页面加载时获取，SPA 切换不会销毁）
const audio = document.getElementById('audioElement');
const musicToggle = document.getElementById('musicToggle');
const vinylPlayer = document.getElementById('vinylPlayer');
const playerClose = document.getElementById('playerClose');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
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
const miniPlayer = document.getElementById('miniPlayer');

const miniPlay = document.getElementById('miniPlay');
const miniPlayIcon = document.getElementById('miniPlayIcon');
const miniPrev = document.getElementById('miniPrev');
const miniNext = document.getElementById('miniNext');
const miniTrack = document.getElementById('miniTrack');
const miniArtist = document.getElementById('miniArtist');
const miniCoverIcon = document.getElementById('miniCoverIcon');
const miniRingFill = document.getElementById('miniRingFill');
const miniCollapseBtn = document.getElementById('miniCollapseBtn');
const miniExpandBtn = document.getElementById('miniExpandBtn');
const miniShuffle = document.getElementById('miniShuffle');
const miniRepeat = document.getElementById('miniRepeat');

// 播放器状态（全局变量，SPA 切换不重置）
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0;
let isCollapsed = false;
let playerInitialized = false;

// 保存播放进度（localStorage），刷新页面后可恢复
const PROGRESS_KEY = 'audioProgress';

// ========== 环形进度 ==========
const RING_CIRC = 2 * Math.PI * 28;
function setRingProgress(pct) {
    if (!miniRingFill) return;
    miniRingFill.style.strokeDashoffset = RING_CIRC * (1 - pct);
}

// ========== 收起 / 展开 ==========
function initCollapse() {
    isCollapsed = localStorage.getItem('miniPlayerCollapsed') === 'true';
    applyCollapseState();
    if (miniCollapseBtn) miniCollapseBtn.addEventListener('click', e => { e.stopPropagation(); toggleCollapse(); });
    if (miniExpandBtn) miniExpandBtn.addEventListener('click', e => { e.stopPropagation(); toggleCollapse(); });
}

function toggleCollapse() {
    isCollapsed = !isCollapsed;
    localStorage.setItem('miniPlayerCollapsed', String(isCollapsed));
    applyCollapseState();
}

function applyCollapseState() {
    if (!miniPlayer) return;
    if (isCollapsed) {
        miniPlayer.classList.add('collapsed');
        if (miniCollapseBtn) miniCollapseBtn.title = '展开播放器';
    } else {
        miniPlayer.classList.remove('collapsed');
        if (miniCollapseBtn) miniCollapseBtn.title = '收起到侧边';
    }
}

// ========== 播放器初始化（只执行一次） ==========
function initPlayer() {
    if (playerInitialized) return;
    playerInitialized = true;

    audio.volume = 0.7;
    renderPlaylist();
    loadTrack(currentIndex);

    audio.addEventListener('loadedmetadata', () => { totalTimeEl.textContent = formatTime(audio.duration); });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleAudioError);

    // 定期保存播放进度
    setInterval(saveProgress, 3000);

    // 恢复上次进度
    restoreProgress();

    if (miniRingFill) {
        miniRingFill.style.strokeDasharray = RING_CIRC;
        miniRingFill.style.strokeDashoffset = RING_CIRC;
    }

    initCollapse();

    // 首次提示
    if (!sessionStorage.getItem('miniPlayerShown') && !isPlaying) {
        setTimeout(() => {
            if (!isPlaying && miniPlayer) miniPlayer.classList.add('show');
            sessionStorage.setItem('miniPlayerShown', '1');
        }, 3000);
    }
}

function saveProgress() {
    if (audio.currentTime > 5 && audio.duration) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify({
            index: currentIndex,
            time: audio.currentTime,
            isPlaying: isPlaying
        }));
    }
}

function restoreProgress() {
    try {
        const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
        if (data && data.time && data.time < 99999) {
            // 不自动恢复播放（浏览器限制），但恢复进度和曲目
            currentIndex = data.index || 0;
            loadTrack(currentIndex);
            setTimeout(() => { audio.currentTime = data.time; }, 200);
        }
    } catch(e) {}
}

function renderPlaylist() {
    if (!playlistEl) return;
    playlistEl.innerHTML = playlist.map((t, i) => `
        <div class="playlist-item ${i===currentIndex?'active':''}" data-index="${i}">
            <div class="item-icon">${t.icon}</div>
            <div class="item-info">
                <div class="item-name">${t.name}</div>
                <div class="item-artist">${t.artist}</div>
            </div>
            <div class="item-duration">${t.duration}</div>
        </div>`).join('');
    playlistEl.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => { loadTrack(+item.dataset.index); playTrack(); });
    });
}

function loadTrack(index) {
    currentIndex = index;
    const t = playlist[index];
    if (!t) return;
    audio.src = t.src;
    if (trackName) trackName.textContent = t.name;
    if (trackArtist) trackArtist.textContent = t.artist;
    if (miniTrack) miniTrack.textContent = t.name;
    if (miniArtist) miniArtist.textContent = t.artist;
    if (vinylLabel) vinylLabel.textContent = t.icon;
    if (miniCoverIcon) miniCoverIcon.textContent = t.icon;
    if (playlistEl) playlistEl.querySelectorAll('.playlist-item').forEach((el, i) => el.classList.toggle('active', i===index));
    if (progressFill) progressFill.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    setRingProgress(0);
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        updatePlayIcons();
        if (vinylPlayer) vinylPlayer.classList.add('playing');
        if (musicToggle) musicToggle.classList.add('playing');
        if (miniPlayer) { miniPlayer.classList.add('playing'); miniPlayer.classList.add('show'); }
    }).catch(err => { console.warn('播放失败:', err.message); isPlaying = false; updatePlayIcons(); });
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayIcons();
    if (vinylPlayer) vinylPlayer.classList.remove('playing');
    if (musicToggle) musicToggle.classList.remove('playing');
    if (miniPlayer) miniPlayer.classList.remove('playing');
}

function togglePlay() { isPlaying ? pauseTrack() : playTrack(); }

function updatePlayIcons() {
    const ic = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    if (playIcon) playIcon.className = ic;
    if (miniPlayIcon) miniPlayIcon.className = ic;
    if (playBtn) { isPlaying ? playBtn.classList.add('playing') : playBtn.classList.remove('playing'); }
}

function prevTrack() {
    const idx = isShuffle ? Math.floor(Math.random()*playlist.length) : (currentIndex-1+playlist.length)%playlist.length;
    loadTrack(idx); if (isPlaying) playTrack();
}

function nextTrack() {
    const idx = isShuffle ? Math.floor(Math.random()*playlist.length) : (currentIndex+1)%playlist.length;
    loadTrack(idx); if (isPlaying) playTrack();
}

function handleTrackEnd() {
    if (repeatMode===2) { audio.currentTime=0; playTrack(); }
    else if (repeatMode===1) nextTrack();
    else { if (currentIndex<playlist.length-1) nextTrack(); else { pauseTrack(); audio.currentTime=0; } }
}

function handleAudioError() { console.warn('音频加载失败'); if (currentIndex<playlist.length-1) setTimeout(nextTrack, 1000); }

// ========== 进度 ==========
function updateProgress() {
    if (!audio.duration) return;
    requestAnimationFrame(() => {
        const pct = audio.currentTime / audio.duration;
        if (progressFill) progressFill.style.width = `${pct*100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        setRingProgress(pct);
    });
}

function formatTime(s) {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m}:${sec.toString().padStart(2,'0')}`;
}

if (progressBar) {
    progressBar.addEventListener('click', e => {
        if (!audio.duration) return;
        const r = progressBar.getBoundingClientRect();
        audio.currentTime = ((e.clientX-r.left)/r.width)*audio.duration;
    });
}

// ========== 音量 ==========
if (volumeBar) {
    volumeBar.addEventListener('click', e => {
        const r = volumeBar.getBoundingClientRect();
        audio.volume = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
        if (volumeFill) volumeFill.style.width = `${audio.volume*100}%`;
        updateVolumeIcon();
    });
}

function updateVolumeIcon() {
    if (!volumeIcon) return;
    const v = audio.volume;
    volumeIcon.className = v===0 ? 'fas fa-volume-mute' : v<0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
}

if (volumeIcon) {
    volumeIcon.addEventListener('click', () => {
        if (audio.volume>0) { audio.dataset.lv = audio.volume; audio.volume=0; if (volumeFill) volumeFill.style.width='0%'; }
        else { audio.volume = +audio.dataset.lv || 0.7; if (volumeFill) volumeFill.style.width=`${audio.volume*100}%`; }
        updateVolumeIcon();
    });
}

// ========== 随机 / 循环 ==========
if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        if (miniShuffle) miniShuffle.classList.toggle('active', isShuffle);
    });
}

if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
        repeatMode = (repeatMode+1)%3;
        repeatBtn.classList.remove('active');
        [miniRepeat, repeatBtn].forEach(el => {
            if (!el) return;
            if (repeatMode===0) el.innerHTML = '<i class="fas fa-redo"></i>';
            else { el.innerHTML = '<i class="fas fa-redo" style="color:var(--accent)"></i>'; el.classList.add('active'); }
        });
        if (repeatMode===2) repeatBtn.innerHTML = '<i class="fas fa-redo" style="color:var(--accent)"></i><span style="position:absolute;font-size:0.55rem;top:2px;right:4px;color:var(--accent);font-weight:700;">1</span>';
    });
}

// ========== 面板开关 ==========
if (musicToggle) musicToggle.addEventListener('click', () => vinylPlayer && vinylPlayer.classList.toggle('open'));
if (playerClose) playerClose.addEventListener('click', () => vinylPlayer && vinylPlayer.classList.remove('open'));
if (playlistToggle) playlistToggle.addEventListener('click', () => { playlistEl.classList.toggle('open'); playlistToggle.classList.toggle('open'); });

// ========== 控制按钮 ==========
if (playBtn) playBtn.addEventListener('click', togglePlay);
if (miniPlay) miniPlay.addEventListener('click', togglePlay);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (miniPrev) miniPrev.addEventListener('click', prevTrack);
if (miniNext) miniNext.addEventListener('click', nextTrack);
if (miniShuffle) miniShuffle.addEventListener('click', () => shuffleBtn && shuffleBtn.click());
if (miniRepeat) miniRepeat.addEventListener('click', () => repeatBtn && repeatBtn.click());

// ========== 键盘快捷键 ==========
document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    switch(e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': nextTrack(); break;
        case 'ArrowLeft': prevTrack(); break;
        case 'ArrowUp': e.preventDefault(); audio.volume=Math.min(1,audio.volume+0.1); if (volumeFill) volumeFill.style.width=`${audio.volume*100}%`; updateVolumeIcon(); break;
        case 'ArrowDown': e.preventDefault(); audio.volume=Math.max(0,audio.volume-0.1); if (volumeFill) volumeFill.style.width=`${audio.volume*100}%`; updateVolumeIcon(); break;
        case 'm': if (volumeIcon) volumeIcon.click(); break;
        case 'Escape': if (vinylPlayer) vinylPlayer.classList.remove('open'); break;
    }
});

// ========== 打字机效果：少女乐队，摇滚万岁 ==========
(function () {
    const text = '少女乐队，摇滚万岁';
    const typedText = document.getElementById('typed-text');
    const cursor = document.querySelector('.typed-cursor');

    if (!typedText) return;

    let index = 0;
    const speed = 120; // 打字速度（ms），可调整
    const startDelay = 800; // 页面加载后延迟开始

    function type() {
        if (index < text.length) {
            typedText.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            // 打字完成后，可选：让光标持续闪烁
            cursor.style.animation = 'blink 1s step-end infinite';
        }
    }

    setTimeout(type, startDelay);
})();
// ========== 启动 ==========
initRouter();
initPlayer();
