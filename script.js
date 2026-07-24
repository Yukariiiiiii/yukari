// ========== 主题切换 ==========
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

// 从 localStorage 读取主题偏好
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

// ========== 导航高亮 ==========
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

// ========== 滚动入场动画 ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
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

// ========== 平滑滚动增强 ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
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

// ====================================================================
// ========== 🎵 黑胶音乐播放器 ==========
// ====================================================================

// 使用免费、无版权的音乐（来自 pixabay 等公开资源）
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

// DOM 元素
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
let repeatMode = 0; // 0: off, 1: all, 2: one
let isDragging = false;

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

// 渲染播放列表
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

    // 绑定点击
    playlistEl.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            loadTrack(idx);
            playTrack();
        });
    });
}

// 加载曲目
function loadTrack(index) {
    currentIndex = index;
    const track = playlist[index];
    audio.src = track.src;
    trackName.textContent = track.name;
    trackArtist.textContent = track.artist;
    miniTrack.textContent = track.name;
    miniArtist.textContent = track.artist;
    vinylLabel.textContent = track.icon;

    // 更新播放列表高亮
    playlistEl.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // 重置进度
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
}

// 播放
function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        updatePlayIcons();
        vinylPlayer.classList.add('playing');
        musicToggle.classList.add('playing');
        miniPlayer.classList.add('playing');
        miniPlayer.classList.add('show');
    }).catch(err => {
        console.warn('播放失败（可能是网络问题或浏览器策略）:', err.message);
        // 如果自动播放被阻止，仍然更新 UI 状态
        isPlaying = false;
        updatePlayIcons();
    });
}

// 暂停
function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayIcons();
    vinylPlayer.classList.remove('playing');
    musicToggle.classList.remove('playing');
    miniPlayer.classList.remove('playing');
}

// 切换播放/暂停
function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

// 更新播放图标
function updatePlayIcons() {
    const icon = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    playIcon.className = icon;
    miniPlayIcon.className = icon;
    // 调整播放按钮的图标偏移
    if (isPlaying) {
        playBtn.classList.add('playing');
    } else {
        playBtn.classList.remove('playing');
    }
}

// 上一首
function prevTrack() {
    let idx;
    if (isShuffle) {
        idx = Math.floor(Math.random() * playlist.length);
    } else {
        idx = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    loadTrack(idx);
    if (isPlaying) playTrack();
}

// 下一首
function nextTrack() {
    let idx;
    if (isShuffle) {
        idx = Math.floor(Math.random() * playlist.length);
    } else {
        idx = (currentIndex + 1) % playlist.length;
    }
    loadTrack(idx);
    if (isPlaying) playTrack();
}

// 曲目结束处理
function handleTrackEnd() {
    if (repeatMode === 2) {
        // 单曲循环
        audio.currentTime = 0;
        playTrack();
    } else if (repeatMode === 1) {
        // 列表循环
        nextTrack();
    } else {
        // 不循环
        if (currentIndex < playlist.length - 1) {
            nextTrack();
        } else {
            pauseTrack();
            audio.currentTime = 0;
        }
    }
}

// 音频加载错误处理
function handleAudioError() {
    console.warn('音频加载失败，尝试下一首...');
    if (currentIndex < playlist.length - 1) {
        setTimeout(() => nextTrack(), 1000);
    }
}

// 更新进度条
function updateProgress() {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

// 格式化时间
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// 进度条点击/拖动
progressBar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
});

// 音量控制
volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.volume = Math.max(0, Math.min(1, percent));
    volumeFill.style.width = `${audio.volume * 100}%`;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    const v = audio.volume;
    if (v === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (v < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// 音量图标点击 → 静音切换
volumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.dataset.lastVolume = audio.volume;
        audio.volume = 0;
        volumeFill.style.width = '0%';
    } else {
        const lastVol = audio.dataset.lastVolume || 0.7;
        audio.volume = parseFloat(lastVol);
        volumeFill.style.width = `${audio.volume * 100}%`;
    }
    updateVolumeIcon();
});

// 随机播放切换
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

// 循环模式切换
repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.remove('active');
    repeatBtn.style.color = '';
    
    switch (repeatMode) {
        case 0: // off
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            break;
        case 1: // all
            repeatBtn.innerHTML = '<i class="fas fa-redo" style="color: var(--accent)"></i>';
            repeatBtn.classList.add('active');
            break;
        case 2: // one
            repeatBtn.innerHTML = '<i class="fas fa-redo" style="color: var(--accent)"></i>';
            repeatBtn.classList.add('active');
            // 添加 "1" 标记
            const badge = document.createElement('span');
            badge.style.cssText = 'position:absolute;font-size:0.55rem;margin-top:-8px;margin-left:4px;color:var(--accent);font-weight:700;';
            repeatBtn.style.position = 'relative';
            repeatBtn.innerHTML = '<i class="fas fa-redo" style="color: var(--accent)"></i><span style="position:absolute;font-size:0.55rem;top:2px;right:4px;color:var(--accent);font-weight:700;">1</span>';
            break;
    }
    
    if (repeatMode === 0) {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }
});

// 播放器面板开关
musicToggle.addEventListener('click', () => {
    vinylPlayer.classList.toggle('open');
});

playerClose.addEventListener('click', () => {
    vinylPlayer.classList.remove('open');
});

// 播放列表开关
playlistToggle.addEventListener('click', () => {
    playlistEl.classList.toggle('open');
    playlistToggle.classList.toggle('open');
});

// 控制按钮绑定
playBtn.addEventListener('click', togglePlay);
miniPlay.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
miniPrev.addEventListener('click', prevTrack);
miniNext.addEventListener('click', nextTrack);

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // 不在输入框中时才响应
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    
    switch (e.key) {
        case ' ': // 空格：播放/暂停
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight': // → 下一首
            nextTrack();
            break;
        case 'ArrowLeft': // ← 上一首
            prevTrack();
            break;
        case 'ArrowUp': // ↑ 音量+
            e.preventDefault();
            audio.volume = Math.min(1, audio.volume + 0.1);
            volumeFill.style.width = `${audio.volume * 100}%`;
            updateVolumeIcon();
            break;
        case 'ArrowDown': // ↓ 音量-
            e.preventDefault();
            audio.volume = Math.max(0, audio.volume - 0.1);
            volumeFill.style.width = `${audio.volume * 100}%`;
            updateVolumeIcon();
            break;
        case 'm': // M 静音
            volumeIcon.click();
            break;
    }
});

// 点击页面其他区域关闭播放器面板
document.addEventListener('click', (e) => {
    if (!vinylPlayer.contains(e.target) && 
        !musicToggle.contains(e.target) && 
        vinylPlayer.classList.contains('open')) {
        // 不自动关闭，保持打开状态更友好
    }
});

// 初始化播放器
initPlayer();

// 首次提示
setTimeout(() => {
    if (!isPlaying) {
        miniPlayer.classList.add('show');
    }
}, 3000);
