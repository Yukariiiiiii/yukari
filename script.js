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
        const factor = (index + 1) * 0.5;
        shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});

// ============================
// Typing Effect
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

    window.addEventListener('load', () => {
        setTimeout(typeChar, 500);
    });
}

// ============================
// 🦌 ヨルシカ 全曲播放器 (YouTube)
// ============================
(function () {
    // ---- 歌曲数据库 ----
    const SONGS = [
        // 二人称 (2026)
        {t:"千鳥",a:"二人称",d:"4:11",y:"MpT4XlQ9J9A"},
        {t:"櫂",a:"二人称",d:"3:59",y:"4DqQqQ8YQaY"},
        {t:"あぶく",a:"二人称",d:"3:54",y:"8XQq8wRgRkY"},
        {t:"茜",a:"二人称",d:"3:46",y:""},
        {t:"Magic",a:"二人称",d:"4:20",y:""},
        {t:"Plover",a:"二人称",d:"4:08",y:""},
        // Singles
        {t:"Play Sick",a:"Single",d:"3:55",y:""},
        {t:"DARMA GRAND PRIX",a:"Single",d:"4:19",y:""},
        {t:"火星人",a:"Single",d:"3:54",y:"5kL8xKJYQwQ"},
        {t:"へび",a:"Single",d:"4:15",y:""},
        {t:"太陽",a:"Single",d:"4:26",y:"Qgj3xHRlGr8"},
        {t:"忘れてください",a:"Single",d:"3:38",y:""},
        {t:"ルバート",a:"Single",d:"3:51",y:""},
        {t:"晴る",a:"Single",d:"4:30",y:""},
        {t:"月光浴",a:"Single",d:"4:08",y:""},
        {t:"斜陽",a:"Single",d:"3:20",y:""},
        {t:"アポリア",a:"Single",d:"4:00",y:""},
        {t:"憂、燦々",a:"Single",d:"4:09",y:""},
        {t:"修羅",a:"Single",d:"3:59",y:"h4F-q-R67H0"},
        {t:"八月、某、月明かり",a:"Single",d:"4:36",y:"Vs5NViM8TSY"},
        {t:"第一夜",a:"Single",d:"4:20",y:""},
        {t:"都落ち",a:"Single",d:"4:10",y:""},
        {t:"テレパス",a:"Single",d:"4:54",y:""},
        // 幻燈 (2023)
        {t:"夏の肖像",a:"幻燈",d:"5:25",y:""},
        {t:"ブレーメン",a:"幻燈",d:"4:32",y:""},
        {t:"チノカテ",a:"幻燈",d:"4:07",y:""},
        {t:"雪国",a:"幻燈",d:"4:47",y:""},
        {t:"月に吠える",a:"幻燈",d:"4:26",y:""},
        {t:"451",a:"幻燈",d:"3:29",y:""},
        {t:"左右盲",a:"幻燈",d:"4:27",y:""},
        {t:"アルジャーノン",a:"幻燈",d:"4:14",y:""},
        {t:"又三郎",a:"幻燈",d:"3:47",y:""},
        // 創作 (2021)
        {t:"嘘月",a:"創作",d:"4:50",y:""},
        {t:"風を食む",a:"創作",d:"4:26",y:""},
        {t:"春泥棒",a:"創作",d:"4:50",y:"Sw1Flgub9s8"},
        {t:"Creation",a:"創作",d:"1:34",y:""},
        // 盗作 (2020)
        {t:"思想犯",a:"盗作",d:"4:11",y:""},
        {t:"盗作",a:"盗作",d:"3:59",y:""},
        {t:"売春",a:"盗作",d:"3:38",y:""},
        {t:"花人局",a:"盗作",d:"5:32",y:""},
        {t:"逃亡",a:"盗作",d:"4:47",y:""},
        {t:"夜行",a:"盗作",d:"3:23",y:""},
        {t:"花に亡霊",a:"盗作",d:"4:01",y:""},
        // エルマ (2019)
        {t:"心に穴が空いた",a:"エルマ",d:"4:25",y:""},
        {t:"歩く",a:"エルマ",d:"3:27",y:""},
        {t:"声",a:"エルマ",d:"4:49",y:""},
        {t:"雨晴るる",a:"エルマ",d:"3:43",y:""},
        {t:"神のまねき",a:"エルマ",d:"3:52",y:""},
        {t:"雨とカプチーノ",a:"エルマ",d:"4:30",y:"PWbRleMGagU"},
        {t:"Amy",a:"エルマ",d:"3:33",y:""},
        {t:"ノーチラス",a:"エルマ",d:"4:00",y:"0qrap3aJiUk"},
        // 辞めた (2019)
        {t:"だから僕は音楽を辞めた",a:"辞めた",d:"4:03",y:""},
        {t:"パレード",a:"辞めた",d:"5:00",y:""},
        {t:"藍二乗",a:"辞めた",d:"4:06",y:""},
        {t:"言って。",a:"辞めた",d:"3:44",y:""},
        {t:"夜紛い",a:"辞めた",d:"3:44",y:""},
        {t:"詩書きとコーヒー",a:"辞めた",d:"4:07",y:""},
        // 負け犬 (2018)
        {t:"ただ君に晴れ",a:"負け犬",d:"4:30",y:"-VKIqrvVOpo"},
        {t:"ヒッチコック",a:"負け犬",d:"3:50",y:""},
        {t:"透明エレジー",a:"負け犬",d:"4:20",y:""},
        // 夏草 (2017)
        {t:"雲と幽霊",a:"夏草",d:"4:15",y:""},
        {t:"深藍",a:"夏草",d:"4:30",y:""},
        {t:"Just a Sunny Day for You",a:"夏草",d:"4:20",y:""},
        {t:"硝子玉",a:"Single",d:"3:40",y:""},
        // Other
        {t:"老人と海",a:"Single",d:"4:15",y:"xIVZLnXXmJM"},
        {t:"猫日",a:"Single",d:"3:50",y:""},
        {t:"灯星",a:"Single",d:"4:10",y:""},
        {t:"紙ひこうき",a:"Single",d:"4:05",y:""},
        {t:"若者のすべて",a:"Single",d:"4:15",y:""},
        {t:"Yu, Sansan",a:"Single",d:"3:30",y:""},
        {t:"昼鳶",a:"Single",d:"4:00",y:""},
        {t:"Bubble",a:"Single",d:"3:40",y:""},
        {t:"Madder",a:"Single",d:"3:30",y:""},
    ];

    // ---- DOM ----
    const musicToggle = document.getElementById('musicToggle');
    const musicPlayer = document.getElementById('musicPlayer');
    const musicClose = document.getElementById('musicClose');
    const yrkCover = document.getElementById('yrkCover');
    const yrkTrackTitle = document.getElementById('yrkTrackTitle');
    const yrkTrackMeta = document.getElementById('yrkTrackMeta');
    const yrkPlayBtn = document.getElementById('yrkPlayBtn');
    const yrkPlayIcon = document.getElementById('yrkPlayIcon');
    const yrkPrevBtn = document.getElementById('yrkPrevBtn');
    const yrkNextBtn = document.getElementById('yrkNextBtn');
    const yrkShuffleBtn = document.getElementById('musicShuffleBtn');
    const yrkLoopBtn = document.getElementById('musicLoopBtn');
    const yrkProgressBar = document.getElementById('yrkProgressBar');
    const yrkProgressFill = document.getElementById('yrkProgressFill');
    const yrkTimeCurrent = document.getElementById('yrkTimeCurrent');
    const yrkTimeTotal = document.getElementById('yrkTimeTotal');
    const yrkVolBar = document.getElementById('yrkVolBar');
    const yrkVolFill = document.getElementById('yrkVolFill');
    const yrkPlaylist = document.getElementById('yrkPlaylist');
    const yrkAlbumFilter = document.getElementById('yrkAlbumFilter');
    const yrkYtWrap = document.getElementById('yrkYtWrap');
    const yrkYtFrame = document.getElementById('yrkYtFrame');
    const yrkSearchInput = document.getElementById('yrkSearchInput');
    const yrkSearchBtn = document.getElementById('yrkSearchBtn');

    // ---- 状态 ----
    let idx = 0;
    let playing = false;
    let shuffle = false;
    let loop = true;
    let list = [...SONGS];
    let progTimer = null;
    let curTime = 0;
    let vol = 70;

    // ---- 工具函数 ----
    const parseT = s => { const p = s.split(':'); return parseInt(p[0])*60 + parseInt(p[1]||0); };
    const fmtT = s => { const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; };
    function toast2(msg) {
        let t = document.getElementById('yrkToast');
        if (!t) { t = document.createElement('div'); t.id = 'yrkToast'; t.className = 'yrk-toast'; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ---- 打开/关闭 ----
    musicToggle.addEventListener('click', () => {
        musicPlayer.classList.toggle('active');
        musicToggle.classList.toggle('playing', playing);
    });
    musicClose.addEventListener('click', () => {
        musicPlayer.classList.remove('active');
    });

    // ---- 加载歌曲 ----
    function loadSong(i) {
        if (i < 0 || i >= list.length) return;
        const s = list[i];
        idx = i;

        yrkTrackTitle.textContent = s.y ? '🎵 ' + s.t : '🔍 ' + s.t + ' (搜索中)';
        yrkTrackMeta.textContent = s.a + ' · ' + s.d + (s.y ? '' : ' · 点击搜索按钮查找');

        yrkTimeTotal.textContent = s.d;
        curTime = 0;
        yrkProgressFill.style.width = '0%';
        yrkTimeCurrent.textContent = '0:00';

        if (s.y) {
            yrkYtWrap.style.display = 'block';
            yrkYtFrame.src = `https://www.youtube.com/embed/${s.y}?autoplay=1&enablejsapi=1&rel=0&volume=${vol}`;
        } else {
            // 无ID → YouTube搜索
            yrkYtWrap.style.display = 'block';
            yrkYtFrame.src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent('ヨルシカ '+s.t)}&autoplay=1`;
            toast2(`🔍 搜索 "ヨルシカ ${s.t}" — 找到后可在评论区告诉我视频ID`);
        }

        renderPlaylist();
    }

    // ---- 播放/暂停 ----
    function playPause() {
        if (!yrkYtFrame.contentWindow) return;
        yrkYtFrame.contentWindow.postMessage(
            JSON.stringify({event:'command', func: playing ? 'pauseVideo' : 'playVideo', args:''}), '*'
        );
    }

    // ---- 下一首/上一首 ----
    function nextS() {
        let n;
        if (shuffle) { do { n = Math.floor(Math.random()*list.length); } while (n===idx && list.length>1); }
        else n = (idx+1) % list.length;
        loadSong(n);
    }
    function prevS() {
        let p;
        if (shuffle) p = Math.floor(Math.random()*list.length);
        else p = (idx-1+list.length) % list.length;
        loadSong(p);
    }

    // ---- YouTube 消息监听 ----
    window.addEventListener('message', e => {
        try {
            const d = JSON.parse(e.data);
            if (d.event === 'onStateChange') {
                if (d.info === 1) { // playing
                    playing = true;
                    yrkPlayIcon.className = 'fas fa-pause';
                    yrkCover.classList.add('playing');
                    musicToggle.classList.add('playing');
                    startProg();
                } else if (d.info === 2) { // paused
                    playing = false;
                    yrkPlayIcon.className = 'fas fa-play';
                    yrkCover.classList.remove('playing');
                    musicToggle.classList.remove('playing');
                    stopProg();
                } else if (d.info === 0) { // ended
                    if (loop) yrkYtFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}','*');
                    else nextS();
                }
            }
        } catch(_) {}
    });

    // ---- 进度模拟 ----
    function startProg() {
        stopProg();
        progTimer = setInterval(() => {
            if (!playing) return;
            const tot = parseT(list[idx]?.d || '0:00');
            if (tot > 0) {
                curTime += 0.5;
                yrkProgressFill.style.width = Math.min(curTime/tot*100,100) + '%';
                yrkTimeCurrent.textContent = fmtT(curTime);
            }
        }, 500);
    }
    function stopProg() { if (progTimer) clearInterval(progTimer); }

    // ---- 渲染播放列表 ----
    function renderPlaylist() {
        const albums = {};
        list.forEach((s, i) => {
            if (!albums[s.a]) albums[s.a] = [];
            albums[s.a].push({s, i});
        });

        let h = '';
        for (const [al, items] of Object.entries(albums)) {
            h += `<div class="yrk-album-group"><div class="yrk-album-label"><span class="yrk-dot"></span>${al}</div>`;
            for (const {s, i} of items) {
                const on = i === idx ? 'on' : '';
                const miss = !s.y ? 'miss' : '';
                h += `<div class="yrk-pl-item ${on} ${miss}" data-i="${i}">
                    <span class="yrk-pl-num">${on ? '<i class="fas fa-volume-up"></i>' : String(i+1).padStart(2,'0')}</span>
                    <span class="yrk-pl-title">${s.t}</span>
                    <span class="yrk-pl-dur">${s.d}</span>
                </div>`;
            }
            h += '</div>';
        }
        yrkPlaylist.innerHTML = h;

        yrkPlaylist.querySelectorAll('.yrk-pl-item').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.i);
                loadSong(i);
            });
        });

        const a = yrkPlaylist.querySelector('.yrk-pl-item.on');
        if (a) a.scrollIntoView({block:'nearest', behavior:'smooth'});
    }

    // ---- 专辑筛选 ----
    function renderAlbumFilter() {
        const albs = ['全部', ...new Set(SONGS.map(s => s.a))];
        yrkAlbumFilter.innerHTML = albs.map((a, i) =>
            `<button class="yrk-filter-btn ${i===0?'active':''}" data-a="${a}">${a}</button>`
        ).join('');

        yrkAlbumFilter.querySelectorAll('.yrk-filter-btn').forEach(b => {
            b.addEventListener('click', () => {
                yrkAlbumFilter.querySelectorAll('.yrk-filter-btn').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                const a = b.dataset.a;
                list = a === '全部' ? [...SONGS] : SONGS.filter(s => s.a === a);
                renderPlaylist();
            });
        });
    }

    // ---- 搜索 ----
    function doSearch() {
        const q = yrkSearchInput.value.trim();
        if (!q) return;

        // 本地搜索
        const found = SONGS.findIndex(s => s.t.toLowerCase().includes(q.toLowerCase()));
        if (found >= 0) {
            list = [...SONGS];
            renderAlbumFilter();
            renderPlaylist();
            loadSong(found);
            toast2(`✅ 找到 "${SONGS[found].t}"`);
            return;
        }

        // YouTube搜索
        yrkYtWrap.style.display = 'block';
        yrkYtFrame.src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent('ヨルシカ '+q)}&autoplay=1`;
        yrkTrackTitle.textContent = '🔍 搜索: ' + q;
        yrkTrackMeta.textContent = 'YouTube 搜索结果';
        toast2(`🔍 YouTube 搜索 "ヨルシカ ${q}"`);
    }
    yrkSearchBtn.addEventListener('click', doSearch);
    yrkSearchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

    // ---- 控制按钮 ----
    yrkPlayBtn.addEventListener('click', playPause);
    yrkNextBtn.addEventListener('click', nextS);
    yrkPrevBtn.addEventListener('click', prevS);

    yrkShuffleBtn.addEventListener('click', function() {
        shuffle = !shuffle;
        this.classList.toggle('active', shuffle);
        toast2(shuffle ? '🔀 随机播放' : '🔀 顺序播放');
    });
    yrkLoopBtn.addEventListener('click', function() {
        loop = !loop;
        this.classList.toggle('active', loop);
        toast2(loop ? '🔁 循环播放' : '🔁 播完即止');
    });

    // ---- 进度条点击 ----
    yrkProgressBar.addEventListener('click', e => {
        const r = yrkProgressBar.getBoundingClientRect();
        const pct = (e.clientX - r.left) / r.width;
        const tot = parseT(list[idx]?.d || '0:00');
        curTime = pct * tot;
        yrkProgressFill.style.width = pct * 100 + '%';
        yrkTimeCurrent.textContent = fmtT(curTime);
        if (yrkYtFrame.contentWindow) {
            yrkYtFrame.contentWindow.postMessage(
                JSON.stringify({event:'command', func:'seekTo', args:[curTime, true]}), '*'
            );
        }
    });

    // ---- 音量 ----
    yrkVolFill.style.width = vol + '%';
    yrkVolBar.addEventListener('click', e => {
        const r = yrkVolBar.getBoundingClientRect();
        vol = Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / r.width * 100)));
        yrkVolFill.style.width = vol + '%';
        if (yrkYtFrame.contentWindow) {
            yrkYtFrame.contentWindow.postMessage(
                JSON.stringify({event:'command', func:'setVolume', args:[vol]}), '*'
            );
        }
    });

    // ---- 键盘快捷键 ----
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!musicPlayer.classList.contains('active') && e.key !== ' ') return;
        switch(e.key) {
            case ' ': e.preventDefault(); playPause(); break;
            case 'ArrowRight': nextS(); break;
            case 'ArrowLeft': prevS(); break;
            case 'ArrowUp':
                e.preventDefault();
                vol = Math.min(100, vol + 10);
                yrkVolFill.style.width = vol + '%';
                break;
            case 'ArrowDown':
                e.preventDefault();
                vol = Math.max(0, vol - 10);
                yrkVolFill.style.width = vol + '%';
                break;
        }
    });

    // ---- 初始化 ----
    renderAlbumFilter();
    renderPlaylist();

    // 自动加载第一首有ID的歌
    const firstValid = SONGS.findIndex(s => s.y);
    if (firstValid >= 0) {
        loadSong(firstValid);
    }

    toast2('🦌 ヨルシカ 播放器就绪 · 按空格播放/暂停');

    // 暴露给全局（方便调试）
    window.yorushikaPlayer = { SONGS, loadSong, nextS, prevS, playPause };
})();
