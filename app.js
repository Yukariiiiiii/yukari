/* ============================================================
   app.js — 个人博客交互逻辑
   - 深浅色主题切换
   - 音乐播放器（播放/暂停/切歌/进度/音量/快捷键）
   - 导航高亮 & 卡片视差效果
   ============================================================ */

(function () {
    'use strict';

    /* --------------------------------------------------------
       1. 主题切换
       -------------------------------------------------------- */
    const themeToggle = document.getElementById('themeToggle');
    const html        = document.documentElement;

    // 初始化：优先读取本地存储，默认深色
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
       2. 音乐播放器
       -------------------------------------------------------- */
    const playlistData = [
        { name: 'Midnight City',    artist: 'M83',            duration: 243, icon: '🎵' },
        { name: 'Starboy',          artist: 'The Weeknd',      duration: 230, icon: '🎧' },
        { name: 'Blinding Lights',  artist: 'The Weeknd',      duration: 200, icon: '🎶' },
        { name: 'Levitating',       artist: 'Dua Lipa',        duration: 203, icon: '🎵' },
        { name: 'Watermelon Sugar', artist: 'Harry Styles',    duration: 174, icon: '🎧' },
        { name: 'Stay',             artist: 'The Kid LAROI',   duration: 141, icon: '🎶' }
    ];

    // DOM 引用
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

    // 状态
    let currentTrack = 0;
    let isPlaying    = false;
    let progress     = 0;
    let tickInterval = null;
    let volume       = 0.7;
    let isMuted      = false;

    /* -- 工具函数 -- */
    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + s.toString().padStart(2, '0');
    }

    /* -- 渲染播放列表 -- */
    function renderPlaylist() {
        const html = playlistData.map(function (track, i) {
            const icon = (i === currentTrack && isPlaying) ? '🔊' : '🎵';
            return (
                '<li class="' + (i === currentTrack ? 'active' : '') + '" data-index="' + i + '">' +
                    '<span class="pl-icon">' + icon + '</span>' +
                    '<span>' + track.name + '</span>' +
                    '<span class="pl-duration">' + formatTime(track.duration) + '</span>' +
                '</li>'
            );
        }).join('');

        playlistEl.innerHTML = html;

        // 绑定点击切歌
        playlistEl.querySelectorAll('li').forEach(function (li) {
            li.addEventListener('click', function () {
                currentTrack = parseInt(li.dataset.index, 10);
                progress    = 0;
                loadTrack();
                if (isPlaying) startProgress();
            });
        });
    }

    /* -- 加载当前曲目信息 -- */
    function loadTrack() {
        const track = playlistData[currentTrack];
        trackName.textContent   = track.name;
        trackArtist.textContent = track.artist;
        totalTimeEl.textContent = formatTime(track.duration);
        currentTimeEl.textContent = '0:00';
        progressFill.style.width = '0%';
        renderPlaylist();
    }

    /* -- 播放 / 暂停 -- */
    function togglePlay() {
        isPlaying = !isPlaying;
        player.classList.toggle('playing', isPlaying);

        const icon = isPlaying ? '⏸' : '▶';
        playBtn.textContent  = icon;
        playBtn2.textContent = icon;

        if (isPlaying) {
            startProgress();
        } else {
            stopProgress();
        }
        renderPlaylist();
    }

    /* -- 进度计时 -- */
    function startProgress() {
        stopProgress();
        const track = playlistData[currentTrack];
        tickInterval = setInterval(function () {
            progress += 0.5;
            const pct = (progress / track.duration) * 100;
            progressFill.style.width = pct + '%';
            currentTimeEl.textContent = formatTime(progress);

            if (progress >= track.duration) {
                nextTrack();
            }
        }, 500);
    }

    function stopProgress() {
        if (tickInterval) {
            clearInterval(tickInterval);
            tickInterval = null;
        }
    }

    /* -- 上一首 / 下一首 -- */
    function nextTrack() {
        currentTrack = (currentTrack + 1) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) startProgress();
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + playlistData.length) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) startProgress();
    }

    /* -- 展开 / 收起播放器 -- */
    playerToggle.addEventListener('click', function () {
        player.classList.toggle('expanded');
        playerToggle.classList.toggle('expanded-margin');
    });

    /* -- 按钮事件 -- */
    playBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePlay();
    });

    playBtn2.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    /* -- 进度条点击跳转 -- */
    progressBar.addEventListener('click', function (e) {
        const rect = progressBar.getBoundingClientRect();
        const pct  = (e.clientX - rect.left) / rect.width;
        progress = pct * playlistData[currentTrack].duration;
        progressFill.style.width = (pct * 100) + '%';
        currentTimeEl.textContent = formatTime(progress);
    });

    /* -- 静音切换 -- */
    muteBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        volumeFill.style.width = isMuted ? '0%' : (volume * 100) + '%';
    });

    /* -- 音量滑块 -- */
    volumeSlider.addEventListener('click', function (e) {
        const rect = volumeSlider.getBoundingClientRect();
        volume = (e.clientX - rect.left) / rect.width;
        volume = Math.max(0, Math.min(1, volume));
        volumeFill.style.width = (volume * 100) + '%';

        if (isMuted && volume > 0) {
            isMuted = false;
            muteBtn.textContent = '🔊';
        }
    });

    /* -- 键盘快捷键 -- */
    document.addEventListener('keydown', function (e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                nextTrack();
                break;
            case 'ArrowLeft':
                prevTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                volume = Math.min(1, volume + 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                if (isMuted && volume > 0) {
                    isMuted = false;
                    muteBtn.textContent = '🔊';
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                volume = Math.max(0, volume - 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                if (volume === 0) {
                    isMuted = true;
                    muteBtn.textContent = '🔇';
                }
                break;
        }
    });

    // 初始化音乐播放器
    loadTrack();
    renderPlaylist();

    /* --------------------------------------------------------
       3. 导航高亮
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
       4. 卡片 3D 视差效果
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