/* ========================================
   Vinyl Blog · Music Player App
   ======================================== */

(() => {
    'use strict';

    // ========================================
    // 工具函数
    // ========================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const formatTime = (sec) => {
        if (isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    const showToast = (msg, type = '') => {
        const toast = $('#toast');
        toast.textContent = msg;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // ========================================
    // 主题切换
    // ========================================
    const themeToggle = $('#theme-toggle');
    const root = document.documentElement;
    
    // 从localStorage读取主题
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        
        // 重新绘制可视化以适应新主题
        if (visualizer) visualizer.drawBackground();
    });

    // ========================================
    // 音频核心
    // ========================================
    const audio = $('#audio');
    let audioContext = null;
    let analyser = null;
    let source = null;
    let gainNode = null;
    let isInitialized = false;

    const initAudio = () => {
        if (isInitialized) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.85;
            gainNode = audioContext.createGain();
            gainNode.gain.value = 0.7;

            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            isInitialized = true;
        } catch (err) {
            console.warn('AudioContext init failed:', err);
        }
    };

    // ========================================
    // 播放器状态
    // ========================================
    let currentTrack = null;
    let playlist = [];
    let currentIndex = -1;
    let isPlaying = false;
    let vizMode = 'bars';

    // 默认歌单
    playlist = Array.from($$('.playlist-item')).map((el, i) => ({
        src: el.dataset.src,
        title: el.dataset.title,
        artist: el.dataset.artist,
        duration: el.querySelector('.playlist-dur').textContent
    }));

    // ========================================
    // 播放控制
    // ========================================
    const playBtn = $('#playBtn');
    const miniPlayBtn = $('#miniPlayBtn');
    const vinylRecord = $('#vinylRecord');
    const toneArm = $('#toneArm');
    const miniVinyl = $('#miniVinyl');
    const trackTitle = $('#trackTitle');
    const trackArtist = $('#trackArtist');
    const miniTitle = $('#miniTitle');
    const miniArtist = $('#miniArtist');
    const progressFill = $('#progressFill');
    const progressGlow = $('#progressGlow');
    const progressBar = $('#progressBar');
    const currentTimeEl = $('#currentTime');
    const durationEl = $('#duration');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    const miniPlayIcon = miniPlayBtn.querySelector('.mini-play-icon');
    const miniPauseIcon = miniPlayBtn.querySelector('.mini-pause-icon');

    const updatePlayState = (playing) => {
        isPlaying = playing;
        vinylRecord.classList.toggle('playing', playing);
        toneArm.classList.toggle('playing', playing);
        miniVinyl.classList.toggle('playing', playing);
        playIcon.style.display = playing ? 'none' : 'block';
        pauseIcon.style.display = playing ? 'block' : 'none';
        miniPlayIcon.style.display = playing ? 'none' : 'block';
        miniPauseIcon.style.display = playing ? 'block' : 'none';
        
        if (playing && audioContext?.state === 'suspended') {
            audioContext.resume();
        }
    };

    const loadTrack = (track, index) => {
        if (!track) return;
        currentTrack = track;
        currentIndex = index;
        
        audio.src = track.src;
        audio.crossOrigin = 'anonymous';
        
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist || 'Unknown';
        miniTitle.textContent = track.title;
        miniArtist.textContent = track.artist || 'Unknown';

        // 更新歌单高亮
        $$('.playlist-item').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });

        // 更新黑胶标签
        const vinylTitle = $('.vinyl-title');
        if (vinylTitle) {
            vinylTitle.textContent = track.title.length > 12 
                ? track.title.substring(0, 12) + '...' 
                : track.title;
        }

        // 随机黑胶颜色
        const hue = Math.floor(Math.random() * 360);
        const label = $('.vinyl-label');
        if (label) {
            label.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 40) % 360}, 70%, 40%))`;
        }

        showToast(`已加载: ${track.title}`, 'success');
    };

    const playTrack = async (track, index) => {
        initAudio();
        if (audioContext?.state === 'suspended') await audioContext.resume();
        
        loadTrack(track, index);
        try {
            await audio.play();
            updatePlayState(true);
        } catch (err) {
            showToast('播放失败: ' + err.message, 'error');
        }
    };

    const togglePlay = async () => {
        if (!currentTrack && playlist.length > 0) {
            playTrack(playlist[0], 0);
            return;
        }
        if (!currentTrack) {
            showToast('请先加载音频', 'error');
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
                updatePlayState(true);
            } catch (err) {
                showToast('播放失败: ' + err.message, 'error');
            }
        } else {
            audio.pause();
            updatePlayState(false);
        }
    };

    playBtn.addEventListener('click', togglePlay);
    miniPlayBtn.addEventListener('click', togglePlay);

    // 上一首/下一首
    const prevTrack = () => {
        if (playlist.length === 0) return;
        const idx = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
        playTrack(playlist[idx], idx);
    };

    const nextTrack = () => {
        if (playlist.length === 0) return;
        const idx = currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
        playTrack(playlist[idx], idx);
    };

    $('#prevBtn').addEventListener('click', prevTrack);
    $('#nextBtn').addEventListener('click', nextTrack);
    $('#miniNextBtn').addEventListener('click', nextTrack);

    // 快进/快退
    $('#rewindBtn').addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    $('#forwardBtn').addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });

    // 进度条
    audio.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / (audio.duration || 1)) * 100;
        progressFill.style.width = pct + '%';
        progressGlow.style.width = pct + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        nextTrack();
    });

    progressBar.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    });

    // ========================================
    // 音量控制
    // ========================================
    const volumeSlider = $('#volumeSlider');
    const muteBtn = $('#muteBtn');

    volumeSlider.addEventListener('input', () => {
        const vol = volumeSlider.value / 100;
        audio.volume = vol;
        if (gainNode) gainNode.gain.value = vol;
        audio.muted = false;
        updateMuteIcon(false);
    });

    let wasVolume = 0.7;
    muteBtn.addEventListener('click', () => {
        if (audio.muted || audio.volume === 0) {
            audio.muted = false;
            audio.volume = wasVolume;
            volumeSlider.value = wasVolume * 100;
            if (gainNode) gainNode.gain.value = wasVolume;
            updateMuteIcon(false);
        } else {
            wasVolume = audio.volume || 0.7;
            audio.muted = true;
            audio.volume = 0;
            volumeSlider.value = 0;
            if (gainNode) gainNode.gain.value = 0;
            updateMuteIcon(true);
        }
    });

    const updateMuteIcon = (muted) => {
        const volOn = muteBtn.querySelector('.vol-on');
        const volOff = muteBtn.querySelector('.vol-off');
        volOn.style.display = muted ? 'none' : 'block';
        volOff.style.display = muted ? 'block' : 'none';
    };

    // ========================================
    // URL加载
    // ========================================
    const urlInput = $('#urlInput');
    const loadUrlBtn = $('#loadUrlBtn');

    const loadFromUrl = () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast('请输入音频URL', 'error');
            return;
        }
        if (!/^https?:\/\//.test(url)) {
            showToast('请输入有效的HTTP/HTTPS链接', 'error');
            return;
        }

        // 提取文件名作为标题
        let title = '在线音频';
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.split('/').pop() || '在线音频';
            title = filename.replace(/\.[^/.]+$/, "") || '在线音频';
        } catch (e) {}

        const track = {
            src: url,
            title: title,
            artist: 'URL Stream'
        };

        // 添加到歌单
        playlist.push(track);
        renderPlaylistItem(track, playlist.length - 1);
        playTrack(track, playlist.length - 1);
        urlInput.value = '';
    };

    loadUrlBtn.addEventListener('click', loadFromUrl);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loadFromUrl();
    });

    // ========================================
    // 文件上传
    // ========================================
    const fileInput = $('#fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            showToast('请选择音频文件', 'error');
            return;
        }

        const url = URL.createObjectURL(file);
        const track = {
            src: url,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: '本地文件'
        };

        playlist.push(track);
        renderPlaylistItem(track, playlist.length - 1);
        playTrack(track, playlist.length - 1);
        fileInput.value = '';
    });

    // ========================================
    // 歌单渲染
    // ========================================
    const renderPlaylistItem = (track, index) => {
        const container = $('.playlist-container');
        const num = String(index + 1).padStart(2, '0');
        const dur = track.duration || '--:--';
        
        const el = document.createElement('div');
        el.className = 'playlist-item';
        el.dataset.src = track.src;
        el.dataset.title = track.title;
        el.dataset.artist = track.artist || 'Unknown';
        el.innerHTML = `
            <span class="playlist-num">${num}</span>
            <div class="playlist-info">
                <span class="playlist-title"></span>
                <span class="playlist-artist"></span>
            </div>
            <span class="playlist-dur">${dur}</span>
        `;
        
        // 使用textContent防止XSS
        el.querySelector('.playlist-title').textContent = track.title;
        el.querySelector('.playlist-artist').textContent = track.artist || 'Unknown';
        
        el.addEventListener('click', () => playTrack(track, index));
        container.appendChild(el);
    };

    // 歌单点击
    $$('.playlist-item').forEach((el, i) => {
        el.addEventListener('click', () => {
            const track = {
                src: el.dataset.src,
                title: el.dataset.title,
                artist: el.dataset.artist
            };
            playTrack(track, i);
        });
    });

    // ========================================
    // 音频可视化
    // ========================================
    const vizCanvas = $('#visualizer');
    const vizCtx = vizCanvas.getContext('2d');
    vizMode = 'bars';
    let particles = [];

    const resizeVizCanvas = () => {
        const rect = vizCanvas.parentElement.getBoundingClientRect();
        vizCanvas.width = rect.width - 72;
        vizCanvas.height = 120;
    };
    resizeVizCanvas();
    window.addEventListener('resize', resizeVizCanvas);

    // 可视化模式切换
    $$('.viz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.viz-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            vizMode = btn.dataset.mode;
            particles = [];
            if (vizMode === 'particles') {
                for (let i = 0; i < 60; i++) {
                    particles.push({
                        x: Math.random() * vizCanvas.width,
                        y: Math.random() * vizCanvas.height,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: Math.random() * 3 + 1,
                        hue: Math.random() * 60 + 260
                    });
                }
            }
        });
    });

    const getThemeColors = () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        return {
            isDark,
            primary: isDark ? '167, 139, 250' : '124, 58, 237',
            secondary: isDark ? '244, 114, 182' : '236, 72, 153',
            bg: isDark ? '10, 10, 26' : '240, 240, 245',
            text: isDark ? '255, 255, 255' : '26, 26, 46'
        };
    };

    const drawBars = (data) => {
        const { primary, secondary } = getThemeColors();
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        const barW = w / data.length;
        
        vizCtx.clearRect(0, 0, w, h);
        
        for (let i = 0; i < data.length; i++) {
            const barH = (data[i] / 255) * h * 0.85;
            const x = i * barW;
            const y = h - barH;
            
            const gradient = vizCtx.createLinearGradient(0, h, 0, 0);
            const ratio = i / data.length;
            gradient.addColorStop(0, `rgba(${primary}, ${0.3 + ratio * 0.5})`);
            gradient.addColorStop(1, `rgba(${secondary}, ${0.6 + ratio * 0.3})`);
            
            vizCtx.fillStyle = gradient;
            vizCtx.shadowBlur = 8;
            vizCtx.shadowColor = `rgba(${primary}, 0.4)`;
            
            const radius = Math.min(barW * 0.3, 4);
            vizCtx.beginPath();
            vizCtx.roundRect(x + 1, y, Math.max(barW - 2, 2), barH, radius);
            vizCtx.fill();
        }
        vizCtx.shadowBlur = 0;
    };

    const drawWave = (data) => {
        const { primary, secondary } = getThemeColors();
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        const step = w / data.length;
        
        vizCtx.clearRect(0, 0, w, h);
        
        // 对称波形
        vizCtx.lineWidth = 2;
        vizCtx.shadowBlur = 10;
        
        // 上半部分
        vizCtx.shadowColor = `rgba(${primary}, 0.5)`;
        vizCtx.strokeStyle = `rgba(${primary}, 0.8)`;
        vizCtx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const y = h / 2 - (data[i] / 255) * (h / 2) * 0.85;
            i === 0 ? vizCtx.moveTo(x, y) : vizCtx.lineTo(x, y);
        }
        vizCtx.stroke();
        
        // 下半部分
        vizCtx.shadowColor = `rgba(${secondary}, 0.5)`;
        vizCtx.strokeStyle = `rgba(${secondary}, 0.8)`;
        vizCtx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const y = h / 2 + (data[i] / 255) * (h / 2) * 0.85;
            i === 0 ? vizCtx.moveTo(x, y) : vizCtx.lineTo(x, y);
        }
        vizCtx.stroke();
        
        vizCtx.shadowBlur = 0;
    };

    const drawCircle = (data) => {
        const { primary, secondary } = getThemeColors();
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.25;
        
        vizCtx.clearRect(0, 0, w, h);
        vizCtx.lineWidth = 2.5;
        
        const bars = data.length;
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const val = data[i] / 255;
            const r1 = radius;
            const r2 = radius + val * radius * 0.8;
            
            const x1 = cx + Math.cos(angle) * r1;
            const y1 = cy + Math.sin(angle) * r1;
            const x2 = cx + Math.cos(angle) * r2;
            const y2 = cy + Math.sin(angle) * r2;
            
            const hue = (i / bars) * 60 + 260;
            vizCtx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.4 + val * 0.5})`;
            vizCtx.shadowBlur = 6;
            vizCtx.shadowColor = `hsla(${hue}, 70%, 60%, 0.4)`;
            vizCtx.beginPath();
            vizCtx.moveTo(x1, y1);
            vizCtx.lineTo(x2, y2);
            vizCtx.stroke();
        }
        
        // 中心圆
        vizCtx.shadowBlur = 0;
        vizCtx.beginPath();
        vizCtx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        vizCtx.fillStyle = `rgba(${primary}, 0.05)`;
        vizCtx.fill();
        vizCtx.strokeStyle = `rgba(${primary}, 0.2)`;
        vizCtx.lineWidth = 1;
        vizCtx.stroke();
        
        vizCtx.shadowBlur = 0;
    };

    const drawParticles = (data) => {
        const { primary, secondary, isDark } = getThemeColors();
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        
        vizCtx.fillStyle = isDark ? 'rgba(10, 10, 26, 0.15)' : 'rgba(240, 240, 245, 0.15)';
        vizCtx.fillRect(0, 0, w, h);
        
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const intensity = avg / 255;
        
        particles.forEach((p, i) => {
            p.x += p.vx * (1 + intensity * 3);
            p.y += p.vy * (1 + intensity * 3);
            
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            
            const size = p.size * (1 + intensity * 3);
            const dataIdx = Math.floor((i / particles.length) * data.length);
            const val = data[dataIdx] / 255;
            
            vizCtx.beginPath();
            vizCtx.arc(p.x, p.y, size + val * 3, 0, Math.PI * 2);
            vizCtx.fillStyle = `hsla(${p.hue + intensity * 40}, 80%, ${50 + val * 30}%, ${0.4 + val * 0.4})`;
            vizCtx.shadowBlur = 8;
            vizCtx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
            vizCtx.fill();
        });
        vizCtx.shadowBlur = 0;
    };

    // 可视化主循环
    let animationId = null;
    const visualizer = {
        drawBackground: () => {
            const { isDark } = getThemeColors();
            const w = vizCanvas.width;
            const h = vizCanvas.height;
            vizCtx.clearRect(0, 0, w, h);
        },
        start: () => {
            const loop = () => {
                animationId = requestAnimationFrame(loop);
                
                if (!analyser || !isPlaying) {
                    // 空闲时画静态效果
                    const { primary } = getThemeColors();
                    const w = vizCanvas.width;
                    const h = vizCanvas.height;
                    vizCtx.clearRect(0, 0, w, h);
                    if (vizMode === 'bars' || vizMode === 'wave') {
                        const idleBars = 32;
                        const data = new Uint8Array(idleBars);
                        for (let i = 0; i < idleBars; i++) {
                            data[i] = 10 + Math.sin(Date.now() * 0.002 + i * 0.3) * 8;
                        }
                        if (vizMode === 'bars') drawBars(data);
                        else drawWave(data);
                    }
                    return;
                }
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);
                
                // 降采样到合理数量
                const targetBars = vizMode === 'circle' ? 64 : 48;
                const step = Math.floor(bufferLength / targetBars);
                const sampled = new Uint8Array(targetBars);
                for (let i = 0; i < targetBars; i++) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        sum += dataArray[i * step + j] || 0;
                    }
                    sampled[i] = sum / step;
                }
                
                switch (vizMode) {
                    case 'bars': drawBars(sampled); break;
                    case 'wave': drawWave(sampled); break;
                    case 'circle': drawCircle(sampled); break;
                    case 'particles': drawParticles(sampled); break;
                }
            };
            loop();
        }
    };
    visualizer.start();

    // ========================================
    // 背景粒子动画
    // ========================================
    const bgCanvas = $('#bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    let bgParticles = [];
    
    const resizeBgCanvas = () => {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    };
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    const initBgParticles = () => {
        bgParticles = [];
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < count; i++) {
            bgParticles.push({
                x: Math.random() * bgCanvas.width,
                y: Math.random() * bgCanvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                hue: Math.random() * 60 + 250
            });
        }
    };
    initBgParticles();

    const drawBg = () => {
        requestAnimationFrame(drawBg);
        const { isDark } = getThemeColors();
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        bgParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;
            
            const alpha = isDark ? 0.15 : 0.08;
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            bgCtx.fillStyle = `hsla(${p.hue}, 60%, 60%, ${alpha})`;
            bgCtx.fill();
        });
        
        // 连线
        bgParticles.forEach((p, i) => {
            for (let j = i + 1; j < bgParticles.length; j++) {
                const dx = p.x - bgParticles[j].x;
                const dy = p.y - bgParticles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const alpha = isDark ? 0.05 * (1 - dist / 120) : 0.03 * (1 - dist / 120);
                    bgCtx.strokeStyle = `hsla(${p.hue}, 50%, 50%, ${alpha})`;
                    bgCtx.lineWidth = 0.5;
                    bgCtx.beginPath();
                    bgCtx.moveTo(p.x, p.y);
                    bgCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
                    bgCtx.stroke();
                }
            }
        });
    };
    drawBg();

    // ========================================
    // 迷你播放器显示
    // ========================================
    const miniPlayer = $('#miniPlayer');
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            miniPlayer.classList.add('visible');
        } else {
            miniPlayer.classList.remove('visible');
        }
    });

    // ========================================
    // 导航高亮
    // ========================================
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.id;
            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    });

    // ========================================
    // 键盘快捷键
    // ========================================
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                break;
            case 'ArrowRight':
                audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
                break;
            case 'm':
                muteBtn.click();
                break;
            case 'n':
                nextTrack();
                break;
            case 'p':
                if (e.shiftKey) prevTrack();
                break;
        }
    });

    // ========================================
    // 初始化
    // ========================================
    visualizer.drawBackground();
    
    // 显示欢迎提示
    setTimeout(() => {
        showToast('🎵 点击歌单或输入URL开始播放', 'success');
    }, 1000);

    // 注册Service Worker（PWA支持）
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();