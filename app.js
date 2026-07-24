/* ============================================================
   app.js — 个人博客交互逻辑
   - 深浅色主题切换
   - 音乐播放器（播放/暂停/切歌/进度/音量/快捷键）
   - 用户自定义添加/删除歌曲（本地文件 + 拖拽 + URL）
   - 导航高亮 & 卡片视差效果
   ============================================================ */

(function () {
    'use strict';

    /* --------------------------------------------------------
       1. 主题切换
       -------------------------------------------------------- */
    const themeToggle = document.getElementById('themeToggle');
    const html        = document.documentElement;

    const savedTheme = localStorage.getItem('blog-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('blog-theme', next);
    });

    /* --------------------------------------------------------
       2. 音乐播放器核心
       -------------------------------------------------------- */

    // ---- 内置默认曲目 ----
    const defaultTracks = [
        { name: 'Midnight City',    artist: 'M83',         duration: 243, icon: '🎵', src: '' },
        { name: 'Starboy',          artist: 'The Weeknd',   duration: 230, icon: '🎧', src: '' },
        { name: 'Blinding Lights',  artist: 'The Weeknd',   duration: 200, icon: '🎶', src: '' },
        { name: 'Levitating',       artist: 'Dua Lipa',     duration: 203, icon: '🎵', src: '' },
        { name: 'Watermelon Sugar', artist: 'Harry Styles', duration: 174, icon: '🎧', src: '' },
        { name: 'Stay',             artist: 'The Kid LAROI',duration: 141, icon: '🎶', src: '' }
    ];

    // ---- 从 localStorage 恢复用户添加的曲目 ----
    let customTracks = [];
    try {
        const stored = localStorage.getItem('blog-custom-tracks');
        if (stored) customTracks = JSON.parse(stored);
    } catch (e) { customTracks = []; }

    // 合并：默认曲目 + 用户自定义曲目
    let playlistData = defaultTracks.concat(customTracks);

    // ---- Audio 对象（真正播放音频） ----
    const audio = new Audio();
    audio.preload = 'metadata';

    // 当前曲目如果是用户上传的本地文件，用 objectURL
    function getCurrentSrc() {
        const t = playlistData[currentTrack];
        if (t._objectURL) return t._objectURL;
        // 演示曲目没有真实音频，用静默 oscillator 模拟（见下方）
        return null;
    }

    // 演示模式：当没有真实音频源时，用定时器模拟进度
    let demoMode = true;

    // ---- DOM 引用 ----
    const player        = document.getElementById('musicPlayer');
    const playerToggle  = document.getElementById('playerToggle');
    const playBtn       = document.getElementById('playBtn');
    const playBtn2      = document.getElementById('playBtn2');
    const prevBtn       = document.getElementById('prevBtn');
    const nextBtn       = document.getElementById('nextBtn');
    const muteBtn       = document.getElementById('muteBtn');
    const trackName     = document.getElementById('trackName');
    const trackArtist   = document.getElementById('trackArtist');
    const progressFill  = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl   = document.getElementById('totalTime');
    const playlistEl    = document.getElementById('playlist');
    const volumeFill    = document.getElementById('volumeFill');
    const progressBar   = document.getElementById('progressBar');
    const volumeSlider  = document.getElementById('volumeSlider');
    const addBtn        = document.getElementById('addTrackBtn');
    const addPanel      = document.getElementById('addPanel');
    const fileInput     = document.getElementById('fileInput');
    const dropZone      = document.getElementById('dropZone');
    const urlInput      = document.getElementById('urlInput');
    const addUrlBtn     = document.getElementById('addUrlBtn');

    // ---- 状态 ----
    let currentTrack = 0;
    let isPlaying    = false;
    let progress     = 0;
    let tickInterval = null;
    let volume       = 0.7;
    let isMuted      = false;

    /* ---------- 工具函数 ---------- */
    function formatTime(sec) {
        sec = Math.max(0, Math.floor(sec));
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + ':' + s.toString().padStart(2, '0');
    }

    function saveCustomTracks() {
        try {
            localStorage.setItem('blog-custom-tracks', JSON.stringify(customTracks));
        } catch (e) { /* 忽略配额错误 */ }
    }

    function refreshPlaylist() {
        playlistData = defaultTracks.concat(customTracks);
        if (currentTrack >= playlistData.length) {
            currentTrack = 0;
            progress = 0;
        }
    }

    /* ---------- 渲染播放列表 ---------- */
    function renderPlaylist() {
        const html = playlistData.map(function (track, i) {
            const isCustom = i >= defaultTracks.length;
            const icon = (i === currentTrack && isPlaying) ? '🔊' : track.icon;
            return (
                '<li class="' + (i === currentTrack ? 'active' : '') + '" data-index="' + i + '">' +
                    '<span class="pl-icon">' + icon + '</span>' +
                    '<span class="pl-name">' + escapeHtml(track.name) + '</span>' +
                    (isCustom
                        ? '<button class="pl-remove" data-remove="' + i + '" title="删除">✕</button>'
                        : '') +
                    '<span class="pl-duration">' + formatTime(track.duration) + '</span>' +
                '</li>'
            );
        }).join('');

        playlistEl.innerHTML = html;

        // 点击切歌
        playlistEl.querySelectorAll('li').forEach(function (li) {
            li.addEventListener('click', function (e) {
                if (e.target.classList.contains('pl-remove')) return;
                selectTrack(parseInt(li.dataset.index, 10));
            });
        });

        // 删除按钮
        playlistEl.querySelectorAll('.pl-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeTrack(parseInt(btn.dataset.remove, 10));
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ---------- 选择曲目 ---------- */
    function selectTrack(index) {
        currentTrack = index;
        progress = 0;
        loadTrack();
        if (isPlaying) {
            startProgress();
            playAudio();
        }
    }

    /* ---------- 加载曲目信息 ---------- */
    function loadTrack() {
        const track = playlistData[currentTrack];
        trackName.textContent   = track.name;
        trackArtist.textContent = track.artist;
        totalTimeEl.textContent = formatTime(track.duration);
        currentTimeEl.textContent = '0:00';
        progressFill.style.width = '0%';

        // 设置音频源
        const src = getCurrentSrc();
        demoMode = !src;
        if (src) {
            audio.src = src;
        }
        renderPlaylist();
    }

    /* ---------- 播放 / 暂停 ---------- */
    function togglePlay() {
        isPlaying = !isPlaying;
        player.classList.toggle('playing', isPlaying);

        const icon = isPlaying ? '⏸' : '▶';
        playBtn.textContent  = icon;
        playBtn2.textContent = icon;

        if (isPlaying) {
            playAudio();
            startProgress();
        } else {
            pauseAudio();
            stopProgress();
        }
        renderPlaylist();
    }

    function playAudio() {
        const src = getCurrentSrc();
        if (src) {
            audio.play().catch(function () { /* 浏览器限制自动播放 */ });
        }
    }

    function pauseAudio() {
        if (audio.src) audio.pause();
    }

    /* ---------- 进度计时 ---------- */
    function startProgress() {
        stopProgress();
        const track = playlistData[currentTrack];

        // 真实音频模式：监听 timeupdate
        if (!demoMode && audio.src) {
            audio.addEventListener('timeupdate', onTimeUpdate);
            audio.addEventListener('loadedmetadata', onLoadedMeta);
            audio.addEventListener('ended', onEnded);
            tickInterval = {}; // 占位，真实模式不靠 setInterval
            return;
        }

        // 演示模式：用 setInterval 模拟
        tickInterval = setInterval(function () {
            progress += 0.5;
            const pct = (progress / track.duration) * 100;
            progressFill.style.width = Math.min(pct, 100) + '%';
            currentTimeEl.textContent = formatTime(progress);
            if (progress >= track.duration) nextTrack();
        }, 500);
    }

    function stopProgress() {
        if (tickInterval && tickInterval !== {}) {
            clearInterval(tickInterval);
        }
        tickInterval = null;
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMeta);
        audio.removeEventListener('ended', onEnded);
    }

    function onTimeUpdate() {
        progress = audio.currentTime;
        const dur = audio.duration || playlistData[currentTrack].duration;
        const pct = (progress / dur) * 100;
        progressFill.style.width = Math.min(pct, 100) + '%';
        currentTimeEl.textContent = formatTime(progress);
    }

    function onLoadedMeta() {
        const track = playlistData[currentTrack];
        track.duration = Math.floor(audio.duration) || track.duration;
        totalTimeEl.textContent = formatTime(track.duration);
    }

    function onEnded() {
        nextTrack();
    }

    /* ---------- 上一首 / 下一首 ---------- */
    function nextTrack() {
        currentTrack = (currentTrack + 1) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) playAudio();
        startProgressIfNeeded();
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + playlistData.length) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) playAudio();
        startProgressIfNeeded();
    }

    function startProgressIfNeeded() {
        if (isPlaying) {
            startProgress();
        } else {
            const pct = 0;
            progressFill.style.width = '0%';
            currentTimeEl.textContent = '0:00';
        }
    }

    /* ---------- 展开 / 收起播放器 ---------- */
    playerToggle.addEventListener('click', function () {
        player.classList.toggle('expanded');
        playerToggle.classList.toggle('expanded-margin');
    });

    /* ---------- 按钮事件 ---------- */
    playBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePlay();
    });
    playBtn2.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    /* ---------- 进度条点击 ---------- */
    progressBar.addEventListener('click', function (e) {
        const rect = progressBar.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const track = playlistData[currentTrack];
        progress = pct * (audio.duration || track.duration);
        progressFill.style.width = (pct * 100) + '%';
        currentTimeEl.textContent = formatTime(progress);
        if (!demoMode && audio.src) audio.currentTime = progress;
    });

    /* ---------- 静音 ---------- */
    muteBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        volumeFill.style.width = isMuted ? '0%' : (volume * 100) + '%';
        audio.muted = isMuted;
    });

    /* ---------- 音量 ---------- */
    volumeSlider.addEventListener('click', function (e) {
        const rect = volumeSlider.getBoundingClientRect();
        volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volumeFill.style.width = (volume * 100) + '%';
        audio.volume = volume;
        if (isMuted && volume > 0) {
            isMuted = false;
            muteBtn.textContent = '🔊';
            audio.muted = false;
        }
    });

    // 初始化音量
    audio.volume = volume;

    /* ---------- 键盘快捷键 ---------- */
    document.addEventListener('keydown', function (e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight': nextTrack(); break;
            case 'ArrowLeft':  prevTrack(); break;
            case 'ArrowUp':
                e.preventDefault();
                volume = Math.min(1, volume + 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                audio.volume = volume;
                if (isMuted && volume > 0) { isMuted = false; muteBtn.textContent = '🔊'; audio.muted = false; }
                break;
            case 'ArrowDown':
                e.preventDefault();
                volume = Math.max(0, volume - 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                audio.volume = volume;
                if (volume === 0) { isMuted = true; muteBtn.textContent = '🔇'; audio.muted = true; }
                break;
        }
    });

    /* ============================================================
       3. 添加歌曲功能
       ============================================================ */

    // ---- 展开/收起添加面板 ----
    addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        addPanel.classList.toggle('show');
    });

    // 点击面板内不收起
    addPanel.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // 点击外部收起面板
    document.addEventListener('click', function () {
        addPanel.classList.remove('show');
    });

    /* ---- 方式1：文件选择 ---- */
    fileInput.addEventListener('change', function (e) {
        const files = e.target.files;
        if (!files.length) return;
        handleFiles(files);
        fileInput.value = '';
        addPanel.classList.remove('show');
    });

    /* ---- 方式2：拖拽上传 ---- */
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) handleFiles(files);
    });

    // 支持整个播放器区域拖入文件
    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('drop', function (e) {
        // 只在非输入框区域处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length) {
            // 过滤音频文件
            const audioFiles = Array.from(files).filter(function (f) {
                return f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(f.name);
            });
            if (audioFiles.length) {
                handleFiles(audioFiles);
                showToast('已添加 ' + audioFiles.length + ' 首歌曲 🎵');
            } else {
                showToast('请拖入音频文件 (mp3/wav/ogg/flac)');
            }
        }
    });

    function handleFiles(files) {
        Array.from(files).forEach(function (file) {
            const objectURL = URL.createObjectURL(file);
            const track = {
                name: file.name.replace(/\.[^/.]+$/, ''),  // 去掉扩展名
                artist: '本地文件',
                duration: 0,
                icon: '🎵',
                src: '',
                _objectURL: objectURL,
                _isCustom: true
            };
            customTracks.push(track);

            // 尝试获取真实时长
            const tmpAudio = new Audio(objectURL);
            tmpAudio.addEventListener('loadedmetadata', function () {
                track.duration = Math.floor(tmpAudio.duration) || 0;
                if (playlistData.indexOf(track) !== -1) {
                    const idx = playlistData.indexOf(track);
                    if (idx === currentTrack) totalTimeEl.textContent = formatTime(track.duration);
                }
                renderPlaylist();
            });
        });

        saveCustomTracks();
        refreshPlaylist();
        renderPlaylist();

        // 自动切到新添加的最后一首
        const lastIdx = playlistData.length - 1;
        selectTrack(lastIdx);
        // 展开播放器以便用户看到
        player.classList.add('expanded');
        playerToggle.classList.add('expanded-margin');
    }

    /* ---- 方式3：URL 添加 ---- */
    addUrlBtn.addEventListener('click', function () {
        const url = urlInput.value.trim();
        if (!url) { showToast('请输入音频链接地址'); return; }

        const name = prompt('为这首歌命名：', url.split('/').pop().replace(/\.[^/.]+$/, '') || '网络音频') || '网络音频';
        const artist = prompt('演唱者：', '') || '未知';

        const track = {
            name: name,
            artist: artist,
            duration: 0,
            icon: '🔗',
            src: url,
            _isCustom: true
        };

        customTracks.push(track);
        saveCustomTracks();
        refreshPlaylist();
        renderPlaylist();

        urlInput.value = '';
        addPanel.classList.remove('show');

        const lastIdx = playlistData.length - 1;
        selectTrack(lastIdx);
        player.classList.add('expanded');
        playerToggle.classList.add('expanded-margin');

        showToast('已添加 "' + name + '" 🎶');
    });

    /* ---- 删除曲目 ---- */
    function removeTrack(index) {
        if (index < defaultTracks.length) {
            showToast('内置曲目不可删除');
            return;
        }
        const track = playlistData[index];
        if (track._objectURL) {
            URL.revokeObjectURL(track._objectURL); // 释放内存
        }
        const customIdx = index - defaultTracks.length;
        customTracks.splice(customIdx, 1);
        saveCustomTracks();
        refreshPlaylist();

        if (isPlaying) {
            pauseAudio();
            isPlaying = false;
            player.classList.remove('playing');
            playBtn.textContent = '▶';
            playBtn2.textContent = '▶';
        }
        progress = 0;
        loadTrack();
        renderPlaylist();
        showToast('已删除 "' + track.name + '"');
    }

    /* ---- Toast 提示 ---- */
    let toastTimer = null;
    function showToast(msg) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = [
                'position:fixed', 'bottom:90px', 'right:24px', 'z-index:9999',
                'padding:12px 20px', 'border-radius:14px',
                'background:var(--player-bg)', 'backdrop-filter:blur(20px)',
                '-webkit-backdrop-filter:blur(20px)',
                'border:1px solid var(--glass-border)',
                'color:var(--text-primary)', 'font-size:0.88rem',
                'box-shadow:0 8px 32px var(--glass-shadow)',
                'transform:translateY(20px)', 'opacity:0',
                'transition:all 0.4s ease', 'pointer-events:none'
            ].join(';');
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        // 强制重排后动画
        requestAnimationFrame(function () {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
        }, 2500);
    }

    /* --------------------------------------------------------
       4. 初始化
       -------------------------------------------------------- */
    loadTrack();
    renderPlaylist();

    /* --------------------------------------------------------
       5. 导航高亮
       -------------------------------------------------------- */
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
        });
    });

    /* --------------------------------------------------------
       6. 卡片 3D 视差
       -------------------------------------------------------- */
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect    = card.getBoundingClientRect();
            const x       = e.clientX - rect.left;
            const y       = e.clientY - rect.top;
            const centerX = rect.width  / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;
            card.style.transform =
                'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });

})();