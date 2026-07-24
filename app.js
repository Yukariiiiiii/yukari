/* ============================================================
   app.js — 黑胶音乐播放器 + 音频可视化 + 博客交互
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       1. 主题切换
       ============================================================ */
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('blog-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', function () {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('blog-theme', next);
    });

    /* ============================================================
       2. 音乐播放器核心
       ============================================================ */

    // ---- Audio 元素 ----
    const audio = document.getElementById('audioEl');

    // ---- Web Audio API ----
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let gainNode = null;

    function initWebAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.85;

            gainNode = audioCtx.createGain();
            gainNode.gain.value = volume;

            sourceNode = audioCtx.createMediaElementSource(audio);
            sourceNode.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Web Audio API 不可用:', e);
        }
    }

    // ---- 播放列表数据 ----
    let customTracks = [];
    try {
        const stored = localStorage.getItem('blog-custom-tracks');
        if (stored) customTracks = JSON.parse(stored);
    } catch (e) { customTracks = []; }

    let playlistData = customTracks.slice(); // 初始只有用户添加的

    // ---- DOM ----
    const player = document.getElementById('musicPlayer');
    const playerToggle = document.getElementById('playerToggle');
    const playBtn = document.getElementById('playBtn');
    const playBtn2 = document.getElementById('playBtn2');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const muteBtn = document.getElementById('muteBtn');
    const trackName = document.getElementById('trackName');
    const trackArtist = document.getElementById('trackArtist');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const playlistEl = document.getElementById('playlist');
    const playlistCount = document.getElementById('playlistCount');
    const volumeFill = document.getElementById('volumeFill');
    const progressBar = document.getElementById('progressBar');
    const volumeSlider = document.getElementById('volumeSlider');
    const addBtn = document.getElementById('addTrackBtn');
    const addPanel = document.getElementById('addPanel');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const urlInput = document.getElementById('urlInput');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const visOverlay = document.getElementById('visOverlay');

    // 黑胶标签
    const miniLabel = document.getElementById('miniLabel');
    const discLabel = document.getElementById('discLabel');

    // Canvas 可视化
    const canvas = document.getElementById('visualizer');
    const ctx2d = canvas.getContext('2d');
    let visAnimationId = null;

    // ---- 状态 ----
    let currentTrack = 0;
    let isPlaying = false;
    let progress = 0;
    let volume = 0.7;
    let isMuted = false;
    let isSeeking = false;

    /* ============ 工具函数 ============ */
    function formatTime(sec) {
        sec = Math.max(0, Math.floor(sec));
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + ':' + s.toString().padStart(2, '0');
    }

    function saveCustomTracks() {
        try { localStorage.setItem('blog-custom-tracks', JSON.stringify(customTracks)); } catch (e) {}
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function emojiForName(name) {
        const emojis = ['🎵', '🎶', '🎧', '🎤', '🎸', '🎹', '🥁', '🎺', '🎻', '🔊'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
        return emojis[hash % emojis.length];
    }

    /* ============ 渲染播放列表 ============ */
    function renderPlaylist() {
        if (playlistData.length === 0) {
            playlistEl.innerHTML = '<li class="playlist-empty">🎵 暂无歌曲，点击 ➕ 添加</li>';
        } else {
            const html = playlistData.map(function (track, i) {
                const icon = (i === currentTrack && isPlaying) ? '🔊' : (track.icon || '🎵');
                return (
                    '<li class="' + (i === currentTrack ? 'active' : '') + '" data-index="' + i + '">' +
                        '<span class="pl-icon">' + icon + '</span>' +
                        '<span class="pl-name" title="' + escapeHtml(track.name) + '">' + escapeHtml(track.name) + '</span>' +
                        '<span class="pl-duration">' + formatTime(track.duration) + '</span>' +
                        '<button class="pl-remove" data-remove="' + i + '" title="删除">✕</button>' +
                    '</li>'
                );
            }).join('');
            playlistEl.innerHTML = html;
        }

        playlistCount.textContent = playlistData.length + ' 首';

        playlistEl.querySelectorAll('li[data-index]').forEach(function (li) {
            li.addEventListener('click', function (e) {
                if (e.target.classList.contains('pl-remove')) return;
                selectTrack(parseInt(li.dataset.index, 10));
            });
        });

        playlistEl.querySelectorAll('.pl-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeTrack(parseInt(btn.dataset.remove, 10));
            });
        });
    }

    /* ============ 选择 / 加载曲目 ============ */
    function selectTrack(index) {
        if (index < 0 || index >= playlistData.length) return;
        currentTrack = index;
        progress = 0;
        loadTrack();
        if (isPlaying) {
            audio.play().catch(function () {});
            startVis();
        }
    }

    function loadTrack() {
        const track = playlistData[currentTrack];
        if (!track) return;

        trackName.textContent = track.name;
        trackArtist.textContent = track.artist || '未知艺术家';

        // 更新黑胶标签 emoji
        const emoji = track.icon || emojiForName(track.name);
        if (miniLabel) miniLabel.textContent = emoji;
        if (discLabel) discLabel.textContent = emoji;

        totalTimeEl.textContent = formatTime(track.duration);
        currentTimeEl.textContent = '0:00';
        progressFill.style.width = '0%';

        // 设置音频源
        if (track._objectURL) {
            audio.src = track._objectURL;
        } else if (track.src) {
            audio.src = track.src;
        } else {
            audio.removeAttribute('src');
        }

        renderPlaylist();
    }

    /* ============ 播放 / 暂停 ============ */
    function togglePlay() {
        if (playlistData.length === 0) {
            showToast('请先添加歌曲 ➕');
            addPanel.classList.add('show');
            return;
        }

        isPlaying = !isPlaying;
        player.classList.toggle('playing', isPlaying);
        const icon = isPlaying ? '⏸' : '▶';
        playBtn.textContent = icon;
        playBtn2.textContent = icon;

        if (isPlaying) {
            initWebAudio();
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            const playPromise = audio.play();
            if (playPromise) playPromise.catch(function (err) { console.warn('播放失败:', err); });
            startVis();
            player.classList.add('has-audio');
        } else {
            audio.pause();
            stopVis();
        }
        renderPlaylist();
    }

    /* ============ 进度更新 ============ */
    function onTimeUpdate() {
        if (isSeeking) return;
        progress = audio.currentTime;
        const dur = audio.duration || playlistData[currentTrack].duration || 0;
        if (dur > 0) {
            const pct = (progress / dur) * 100;
            progressFill.style.width = Math.min(pct, 100) + '%';
        }
        currentTimeEl.textContent = formatTime(progress);
    }

    function onLoadedMeta() {
        const track = playlistData[currentTrack];
        if (track && audio.duration && isFinite(audio.duration)) {
            track.duration = Math.floor(audio.duration);
            totalTimeEl.textContent = formatTime(track.duration);
        }
    }

    function onEnded() { nextTrack(); }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    /* ============ 切歌 ============ */
    function nextTrack() {
        if (playlistData.length === 0) return;
        currentTrack = (currentTrack + 1) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) audio.play().catch(function () {});
    }

    function prevTrack() {
        if (playlistData.length === 0) return;
        currentTrack = (currentTrack - 1 + playlistData.length) % playlistData.length;
        progress = 0;
        loadTrack();
        if (isPlaying) audio.play().catch(function () {});
    }

    /* ============ 展开 / 收起 ============ */
    playerToggle.addEventListener('click', function () {
        player.classList.toggle('expanded');
        playerToggle.classList.toggle('expanded-margin');
    });

    /* ============ 按钮事件 ============ */
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePlay(); });
    playBtn2.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    /* ============ 进度条拖动 ============ */
    progressBar.addEventListener('click', function (e) {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * audio.duration;
        progress = audio.currentTime;
        progressFill.style.width = (pct * 100) + '%';
        currentTimeEl.textContent = formatTime(progress);
    });

    /* ============ 音量 ============ */
    muteBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        volumeFill.style.width = isMuted ? '0%' : (volume * 100) + '%';
        audio.muted = isMuted;
        if (gainNode) gainNode.gain.value = isMuted ? 0 : volume;
    });

    volumeSlider.addEventListener('click', function (e) {
        const rect = volumeSlider.getBoundingClientRect();
        volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volumeFill.style.width = (volume * 100) + '%';
        audio.volume = volume;
        if (gainNode) gainNode.gain.value = volume;
        if (isMuted && volume > 0) {
            isMuted = false;
            muteBtn.textContent = '🔊';
            audio.muted = false;
        }
    });

    audio.volume = volume;

    /* ============ 键盘快捷键 ============ */
    document.addEventListener('keydown', function (e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': nextTrack(); break;
            case 'ArrowLeft': prevTrack(); break;
            case 'ArrowUp':
                e.preventDefault();
                volume = Math.min(1, volume + 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                audio.volume = volume;
                if (gainNode) gainNode.gain.value = volume;
                if (isMuted && volume > 0) { isMuted = false; muteBtn.textContent = '🔊'; audio.muted = false; }
                break;
            case 'ArrowDown':
                e.preventDefault();
                volume = Math.max(0, volume - 0.05);
                volumeFill.style.width = (volume * 100) + '%';
                audio.volume = volume;
                if (gainNode) gainNode.gain.value = volume;
                if (volume === 0) { isMuted = true; muteBtn.textContent = '🔇'; audio.muted = true; }
                break;
        }
    });

    /* ============================================================
       3. 音频可视化 (Canvas)
       ============================================================ */
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    function startVis() {
        resizeCanvas();
        if (visAnimationId) cancelAnimationFrame(visAnimationId);
        drawVis();
    }

    function stopVis() {
        if (visAnimationId) {
            cancelAnimationFrame(visAnimationId);
            visAnimationId = null;
        }
        // 清空画布
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawVis() {
        visAnimationId = requestAnimationFrame(drawVis);

        const w = canvas.width;
        const h = canvas.height;
        const bufLen = analyser ? analyser.frequencyBinCount : 0;

        // 半透明清屏（拖尾效果）
        ctx2d.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx2d.fillRect(0, 0, w, h);

        if (!analyser || bufLen === 0) {
            // 无音频时画柔和波形
            drawIdleWave(w, h);
            return;
        }

        const data = new Uint8Array(bufLen);
        analyser.getByteFrequencyData(data);

        const barCount = 48;
        const barWidth = w / barCount;
        const gradient = ctx2d.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, getCSS('--vis-color-1)' || '#6366f1');
        gradient.addColorStop(0.5, getCSS('--vis-color-2)' || '#ec4899');
        gradient.addColorStop(1, getCSS('--vis-color-3)' || '#06b6d4');

        ctx2d.fillStyle = gradient;

        for (let i = 0; i < barCount; i++) {
            const idx = Math.floor(i * bufLen / barCount);
            const val = data[idx] / 255;
            const barH = Math.max(2, val * h * 0.9);
            const x = i * barWidth + 1;
            const y = h - barH;

            // 圆角矩形
            const r = Math.min(barWidth * 0.3, 4);
            ctx2d.beginPath();
            ctx2d.moveTo(x + r, y);
            ctx2d.lineTo(x + barWidth - r - 1, y);
            ctx2d.arcTo(x + barWidth - 1, y, x + barWidth - 1, y + r, r);
            ctx2d.lineTo(x + barWidth - 1, y + barH);
            ctx2d.lineTo(x, y + barH);
            ctx2d.lineTo(x, y + r);
            ctx2d.arcTo(x, y, x + r, y, r);
            ctx2d.closePath();
            ctx2d.fill();
        }

        // 顶部发光效果
        ctx2d.shadowBlur = 10;
        ctx2d.shadowColor = getCSS('--vis-color-1)' || '#6366f1';
        ctx2d.fillStyle = gradient;
        for (let i = 0; i < barCount; i += 6) {
            const idx = Math.floor(i * bufLen / barCount);
            const val = data[idx] / 255;
            if (val > 0.3) {
                const x = i * barWidth + barWidth / 2;
                const y = h - val * h * 0.9 - 2;
                ctx2d.beginPath();
                ctx2d.arc(x, y, 2, 0, Math.PI * 2);
                ctx2d.fill();
            }
        }
        ctx2d.shadowBlur = 0;
    }

    function drawIdleWave(w, h) {
        const t = Date.now() / 1000;
        ctx2d.strokeStyle = getCSS('--vis-color-1)') || '#6366f1';
        ctx2d.lineWidth = 2;
        ctx2d.globalAlpha = 0.4;
        ctx2d.beginPath();
        for (let x = 0; x < w; x += 3) {
            const y = h / 2 + Math.sin(x * 0.05 + t * 2) * 12 * Math.sin(x * 0.01 + t);
            if (x === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
        ctx2d.globalAlpha = 1;
    }

    function getCSS(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }

    // 窗口缩放时重设 canvas
    window.addEventListener('resize', function () {
        if (isPlaying) resizeCanvas();
    });

    /* ============================================================
       4. 添加歌曲
       ============================================================ */

    addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        addPanel.classList.toggle('show');
    });

    addPanel.addEventListener('click', function (e) { e.stopPropagation(); });

    document.addEventListener('click', function () { addPanel.classList.remove('show'); });

    // 文件选择
    fileInput.addEventListener('change', function (e) {
        if (e.target.files.length) {
            handleFiles(e.target.files);
            fileInput.value = '';
            addPanel.classList.remove('show');
        }
    });

    // 拖拽到 dropZone
    dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });

    // 全局拖拽
    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('drop', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            const audioFiles = Array.from(e.dataTransfer.files).filter(function (f) {
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
        let added = 0;
        Array.from(files).forEach(function (file) {
            const objectURL = URL.createObjectURL(file);
            const track = {
                name: file.name.replace(/\.[^/.]+$/, ''),
                artist: '本地文件',
                duration: 0,
                icon: emojiForName(file.name),
                _objectURL: objectURL,
                _isCustom: true
            };
            customTracks.push(track);

            // 获取时长
            const tmp = new Audio(objectURL);
            tmp.addEventListener('loadedmetadata', function () {
                track.duration = Math.floor(tmp.duration) || 0;
                if (playlistData.indexOf(track) !== -1) {
                    const idx = playlistData.indexOf(track);
                    if (idx === currentTrack) totalTimeEl.textContent = formatTime(track.duration);
                }
                renderPlaylist();
            });
            added++;
        });

        saveCustomTracks();
        playlistData = customTracks.slice();
        renderPlaylist();

        const lastIdx = playlistData.length - 1;
        selectTrack(lastIdx);
        player.classList.add('expanded');
        playerToggle.classList.add('expanded-margin');
        showToast('已添加 ' + added + ' 首歌曲 🎶');
    }

    // URL 添加
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
        playlistData = customTracks.slice();
        renderPlaylist();

        urlInput.value = '';
        addPanel.classList.remove('show');

        const lastIdx = playlistData.length - 1;
        selectTrack(lastIdx);
        player.classList.add('expanded');
        playerToggle.classList.add('expanded-margin');
        showToast('已添加 "' + name + '" 🎶');
    });

    /* ============ 删除曲目 ============ */
    function removeTrack(index) {
        const track = playlistData[index];
        if (!track) return;

        if (track._objectURL) URL.revokeObjectURL(track._objectURL);

        const customIdx = customTracks.indexOf(track);
        if (customIdx !== -1) customTracks.splice(customIdx, 1);
        saveCustomTracks();

        playlistData = customTracks.slice();

        if (isPlaying && currentTrack === index) {
            audio.pause();
            isPlaying = false;
            player.classList.remove('playing');
            player.classList.remove('has-audio');
            playBtn.textContent = '▶';
            playBtn2.textContent = '▶';
            stopVis();
        }

        if (currentTrack >= playlistData.length) currentTrack = 0;
        progress = 0;
        loadTrack();
        renderPlaylist();
        showToast('已删除 "' + track.name + '"');
    }

    /* ============ Toast ============ */
    let toastTimer = null;
    function showToast(msg) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        requestAnimationFrame(function () { toast.classList.add('show'); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2500);
    }

    /* ============================================================
       5. 导航高亮
       ============================================================ */
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
        });
    });

    /* ============================================================
       6. 卡片 3D 视差
       ============================================================ */
    document.querySelectorAll('.glass-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            card.style.transform = 'perspective(1000px) rotateX(' + (y - cy) / 30 + 'deg) rotateY(' + (cx - x) / 30 + 'deg) translateY(-4px)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    /* ============================================================
       7. 初始化
       ============================================================ */
    renderPlaylist();
    if (playlistData.length > 0) {
        loadTrack();
    } else {
        trackName.textContent = '点击 ➕ 添加歌曲';
        trackArtist.textContent = '暂无播放内容';
        playlistCount.textContent = '0 首';
    }

})();