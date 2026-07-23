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
// Music Player
// ============================
(function () {
    // 播放列表 - 使用免费音乐CDN链接
    const playlist = [
        {
            title: "Lo-fi Study Beats",
            artist: "Chillhop Music",
            url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
            duration: "3:45"
        },
        {
            title: "Ambient Piano",
            artist: "Kevin MacLeod",
            url: "https://cdn.pixabay.com/download/audio/2022/10/30/audio_3477aef8e2.mp3?filename=sleepy-cat-13181.mp3",
            duration: "2:30"
        },
        {
            title: "Coding Focus",
            artist: "Deep Think",
            url: "https://cdn.pixabay.com/download/audio/2023/03/16/audio_c8e9b22b16.mp3?filename=the-curious-cat-13550.mp3",
            duration: "4:12"
        },
        {
            title: "Night Drive",
            artist: "Synthwave",
            url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=neon-lights-13826.mp3",
            duration: "3:28"
        },
        {
            title: "Morning Coffee",
            artist: "Acoustic Vibes",
            url: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_27b6e0e35f.mp3?filename=acoustic-breeze-14366.mp3",
            duration: "3:15"
        }
    ];

    // 备用播放列表（如果Pixabay链接失效）
    const fallbackPlaylist = [
        {
            title: "Demo Track 1",
            artist: "Unknown",
            url: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
            duration: "0:05"
        }
    ];

    let currentIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;
    let currentTime = 0;
    let duration = 0;
    let progressInterval = null;

    // 创建 audio 元素
    const audio = new Audio();
    audio.volume = 0.7;
    audio.preload = 'metadata';

    // DOM 元素
    const musicToggle = document.getElementById('musicToggle');
    const musicPlayer = document.getElementById('musicPlayer');
    const musicClose = document.getElementById('musicClose');
    const musicPlay = document.getElementById('musicPlay');
    const musicPlayIcon = document.getElementById('musicPlayIcon');
    const musicPrev = document.getElementById('musicPrev');
    const musicNext = document.getElementById('musicNext');
    const musicShuffle = document.getElementById('musicShuffle');
    const musicRepeat = document.getElementById('musicRepeat');
    const musicDisc = document.getElementById('musicDisc');
    const musicSongTitle = document.getElementById('musicSongTitle');
    const musicSongArtist = document.getElementById('musicSongArtist');
    const musicProgressBar = document.getElementById('musicProgressBar');
    const musicProgressFill = document.getElementById('musicProgressFill');
    const musicProgressThumb = document.getElementById('musicProgressThumb');
    const musicCurrentTime = document.getElementById('musicCurrentTime');
    const musicDuration = document.getElementById('musicDuration');
    const musicVolumeBar = document.getElementById('musicVolumeBar');
    const musicVolumeFill = document.getElementById('musicVolumeFill');
    const musicVolumeIcon = document.getElementById('musicVolumeIcon');
    const musicPlaylistToggle = document.getElementById('musicPlaylistToggle');
    const musicPlaylist = document.getElementById('musicPlaylist');
    const visualizerBars = document.querySelectorAll('.music-bar');

    // 渲染播放列表
    function renderPlaylist() {
        musicPlaylist.innerHTML = playlist.map((song, index) => `
            <div class="playlist-item ${index === currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="playlist-item-num">${index === currentIndex && isPlaying ? '<i class="fas fa-volume-up"></i>' : String(index + 1).padStart(2, '0')}</div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${song.title}</div>
                    <div class="playlist-item-artist">${song.artist}</div>
                </div>
                <div class="playlist-item-duration">${song.duration}</div>
            </div>
        `).join('');

        // 绑定点击事件
        musicPlaylist.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                loadSong(idx);
                playAudio();
            });
        });
    }

    // 加载歌曲
    function loadSong(index) {
        currentIndex = index;
        const song = playlist[index];
        audio.src = song.url;
        musicSongTitle.textContent = song.title;
        musicSongArtist.textContent = song.artist;
        musicDuration.textContent = song.duration;

        // 更新播放列表高亮
        renderPlaylist();
    }

    // 播放
    function playAudio() {
        audio.play().then(() => {
            isPlaying = true;
            musicPlayIcon.className = 'fas fa-pause';
            musicToggle.classList.add('playing');
            musicDisc.classList.add('playing');
            startVisualizer();
            startProgressTracking();
        }).catch(err => {
            console.warn('播放失败，尝试下一首:', err);
            // 自动尝试下一首
            if (currentIndex < playlist.length - 1) {
                loadSong(currentIndex + 1);
                playAudio();
            }
        });
    }

    // 暂停
    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        musicPlayIcon.className = 'fas fa-play';
        musicToggle.classList.remove('playing');
        musicDisc.classList.remove('playing');
        stopVisualizer();
        stopProgressTracking();
    }

    // 进度跟踪
    function startProgressTracking() {
        stopProgressTracking();
        progressInterval = setInterval(() => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                musicProgressFill.style.width = percent + '%';
                musicProgressThumb.style.left = percent + '%';
                musicCurrentTime.textContent = formatTime(audio.currentTime);
            }
        }, 500);
    }

    function stopProgressTracking() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    // 可视化动画
    function startVisualizer() {
        visualizerBars.forEach(bar => bar.classList.add('active'));
    }

    function stopVisualizer() {
        visualizerBars.forEach(bar => bar.classList.remove('active'));
    }

    // 格式化时间
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // 下一首
    function nextSong() {
        let nextIdx;
        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * playlist.length);
        } else {
            nextIdx = (currentIndex + 1) % playlist.length;
        }
        loadSong(nextIdx);
        if (isPlaying) playAudio();
    }

    // 上一首
    function prevSong() {
        let prevIdx;
        if (isShuffle) {
            prevIdx = Math.floor(Math.random() * playlist.length);
        } else {
            prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
        }
        loadSong(prevIdx);
        if (isPlaying) playAudio();
    }

    // 事件监听
    musicToggle.addEventListener('click', () => {
        musicPlayer.classList.toggle('active');
        // 第一次打开时加载歌曲
        if (!audio.src && playlist.length > 0) {
            loadSong(0);
        }
    });

    musicClose.addEventListener('click', () => {
        musicPlayer.classList.remove('active');
    });

    musicPlay.addEventListener('click', () => {
        if (!audio.src) loadSong(0);
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    musicNext.addEventListener('click', nextSong);
    musicPrev.addEventListener('click', prevSong);

    musicShuffle.addEventListener('click', () => {
        isShuffle = !isShuffle;
        musicShuffle.classList.toggle('active', isShuffle);
    });

    musicRepeat.addEventListener('click', () => {
        isRepeat = !isRepeat;
        musicRepeat.classList.toggle('active', isRepeat);
        audio.loop = isRepeat;
    });

    // 进度条点击
    musicProgressBar.addEventListener('click', (e) => {
        const rect = musicProgressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration) {
            audio.currentTime = percent * audio.duration;
        }
    });

    // 音量控制
    musicVolumeBar.addEventListener('click', (e) => {
        const rect = musicVolumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const vol = Math.max(0, Math.min(1, percent));
        audio.volume = vol;
        musicVolumeFill.style.width = (vol * 100) + '%';
        updateVolumeIcon(vol);
    });

    function updateVolumeIcon(vol) {
        if (vol === 0) {
            musicVolumeIcon.className = 'fas fa-volume-mute';
        } else if (vol < 0.5) {
            musicVolumeIcon.className = 'fas fa-volume-down';
        } else {
            musicVolumeIcon.className = 'fas fa-volume-up';
        }
    }

    // 播放列表展开/收起
    musicPlaylistToggle.addEventListener('click', () => {
        musicPlaylist.classList.toggle('open');
        musicPlaylistToggle.classList.toggle('open');
    });

    // 歌曲结束
    audio.addEventListener('ended', () => {
        if (!isRepeat) {
            nextSong();
        }
    });

    // 音频元数据加载
    audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
        musicDuration.textContent = formatTime(duration);
    });

    // 音频错误
    audio.addEventListener('error', () => {
        console.warn('音频加载失败:', playlist[currentIndex].title);
        musicSongTitle.textContent = '播放失败';
        musicSongArtist.textContent = '请检查网络或选择其他歌曲';
        isPlaying = false;
        musicPlayIcon.className = 'fas fa-play';
        musicToggle.classList.remove('playing');
        musicDisc.classList.remove('playing');
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // 只在播放器打开时响应
        if (!musicPlayer.classList.contains('active')) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                musicPlay.click();
                break;
            case 'ArrowRight':
                nextSong();
                break;
            case 'ArrowLeft':
                prevSong();
                break;
            case 'ArrowUp':
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.1);
                musicVolumeFill.style.width = (audio.volume * 100) + '%';
                updateVolumeIcon(audio.volume);
                break;
            case 'ArrowDown':
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.1);
                musicVolumeFill.style.width = (audio.volume * 100) + '%';
                updateVolumeIcon(audio.volume);
                break;
        }
    });

    // 初始化
    renderPlaylist();
    musicVolumeFill.style.width = '70%';

    // 保存播放器状态到全局
    window.__musicPlayer = {
        play: playAudio,
        pause: pauseAudio,
        next: nextSong,
        prev: prevSong,
        loadSong: loadSong
    };
})();