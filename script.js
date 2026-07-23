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
// 🦌 ヨルシカ 全曲播放器 (Bilibili)
// ============================
(function () {
    // ---- 歌曲数据库 (B站 BV号) ----
    // 音源全部来自B站搬运/官方MV，国内可直接播放
    const SONGS = [
        // 二人称 (2026)
        {t:"千鳥",a:"二人称",d:"4:11",bvid:"BV1Fp42197QY",page:1},
        {t:"櫂",a:"二人称",d:"3:59",bvid:"BV1Fp42197QY",page:2},
        {t:"あぶく",a:"二人称",d:"3:54",bvid:"",page:0},
        {t:"茜",a:"二人称",d:"3:46",bvid:"",page:0},
        {t:"Magic",a:"二人称",d:"4:20",bvid:"",page:0},
        {t:"Plover",a:"二人称",d:"4:08",bvid:"",page:0},
        // Singles
        {t:"Play Sick",a:"Single",d:"3:55",bvid:"",page:0},
        {t:"DARMA GRAND PRIX",a:"Single",d:"4:19",bvid:"",page:0},
        {t:"火星人",a:"Single",d:"3:54",bvid:"",page:0},
        {t:"へび",a:"Single",d:"4:15",bvid:"",page:0},
        {t:"太陽",a:"Single",d:"4:26",bvid:"",page:0},
        {t:"忘れてください",a:"Single",d:"3:38",bvid:"",page:0},
        {t:"ルバート",a:"Single",d:"3:51",bvid:"",page:0},
        {t:"晴る",a:"Single",d:"4:30",bvid:"BV13Z4y1A78S",page:1},  // 春泥棒LIVE同源UP主
        {t:"月光浴",a:"Single",d:"4:08",bvid:"BV1SB4y1Z7mn",page:1},
        {t:"斜陽",a:"Single",d:"3:20",bvid:"",page:0},
        {t:"アポリア",a:"Single",d:"4:00",bvid:"",page:0},
        {t:"憂、燦々",a:"Single",d:"4:09",bvid:"",page:0},
        {t:"修羅",a:"Single",d:"3:59",bvid:"",page:0},
        {t:"八月、某、月明かり",a:"Single",d:"4:36",bvid:"",page:0},
        {t:"第一夜",a:"Single",d:"4:20",bvid:"",page:0},
        {t:"都落ち",a:"Single",d:"4:10",bvid:"BV1PP411W7BT",page:1},
        {t:"テレパス",a:"Single",d:"4:54",bvid:"",page:0},
        // 幻燈 (2023)
        {t:"夏の肖像",a:"幻燈",d:"5:25",bvid:"",page:0},
        {t:"ブレーメン",a:"幻燈",d:"4:32",bvid:"",page:0},
        {t:"チノカテ",a:"幻燈",d:"4:07",bvid:"",page:0},
        {t:"雪国",a:"幻燈",d:"4:47",bvid:"",page:0},
        {t:"月に吠える",a:"幻燈",d:"4:26",bvid:"",page:0},
        {t:"451",a:"幻燈",d:"3:29",bvid:"",page:0},
        {t:"左右盲",a:"幻燈",d:"4:27",bvid:"",page:0},
        {t:"アルジャーノン",a:"幻燈",d:"4:14",bvid:"",page:0},
        {t:"又三郎",a:"幻燈",d:"3:47",bvid:"BV1Fp42197QY",page:6},  // Hi-Res
        // 創作 (2021)
        {t:"嘘月",a:"創作",d:"4:50",bvid:"BV1P3411x7ru",page:1},
        {t:"風を食む",a:"創作",d:"4:26",bvid:"",page:0},
        {t:"春泥棒",a:"創作",d:"4:50",bvid:"BV13Z4y1A78S",page:1},
        {t:"Creation",a:"創作",d:"1:34",bvid:"",page:0},
        // 盗作 (2020)
        {t:"思想犯",a:"盗作",d:"4:11",bvid:"",page:0},
        {t:"盗作",a:"盗作",d:"3:59",bvid:"",page:0},
        {t:"売春",a:"盗作",d:"3:38",bvid:"",page:0},
        {t:"花人局",a:"盗作",d:"5:32",bvid:"",page:0},
        {t:"逃亡",a:"盗作",d:"4:47",bvid:"",page:0},
        {t:"夜行",a:"盗作",d:"3:23",bvid:"BV1xtzHYrE88",page:1},
        {t:"花に亡霊",a:"盗作",d:"4:01",bvid:"BV1sK4y1a7aB",page:1},
        // エルマ (2019)
        {t:"心に穴が空いた",a:"エルマ",d:"4:25",bvid:"",page:0},
        {t:"歩く",a:"エルマ",d:"3:27",bvid:"",page:0},
        {t:"声",a:"エルマ",d:"4:49",bvid:"",page:0},
        {t:"雨晴るる",a:"エルマ",d:"3:43",bvid:"",page:0},
        {t:"神のまねき",a:"エルマ",d:"3:52",bvid:"",page:0},
        {t:"雨とカプチーノ",a:"エルマ",d:"4:30",bvid:"BV1mx4y1t7Ke",page:1},
        {t:"Amy",a:"エルマ",d:"3:33",bvid:"",page:0},
        {t:"ノーチラス",a:"エルマ",d:"4:00",bvid:"",page:0},
        // 辞めた (2019)
        {t:"だから僕は音楽を辞めた",a:"辞めた",d:"4:03",bvid:"BV1CatSeGE81",page:1},
        {t:"パレード",a:"辞めた",d:"5:00",bvid:"",page:0},
        {t:"藍二乗",a:"辞めた",d:"4:06",bvid:"",page:0},
        {t:"言って。",a:"辞めた",d:"3:44",bvid:"",page:0},
        {t:"夜紛い",a:"辞めた",d:"3:44",bvid:"",page:0},
        {t:"詩書きとコーヒー",a:"辞めた",d:"4:07",bvid:"",page:0},
        // 負け犬 (2018)
        {t:"ただ君に晴れ",a:"負け犬",d:"4:30",bvid:"BV1iognzcEiQ",page:1},
        {t:"ヒッチコック",a:"負け犬",d:"3:50",bvid:"",page:0},
        {t:"透明エレジー",a:"負け犬",d:"4:20",bvid:"",page:0},
        // 夏草 (2017)
        {t:"雲と幽霊",a:"夏草",d:"4:15",bvid:"",page:0},
        {t:"深藍",a:"夏草",d:"4:30",bvid:"",page:0},
        {t:"Just a Sunny Day for You",a:"夏草",d:"4:20",bvid:"",page:0},
        // Other / Live
        {t:"老人と海",a:"Single",d:"4:15",bvid:"BV1pv411N7gN",page:1},
        {t:"猫日",a:"Single",d:"3:50",bvid:"",page:0},
        {t:"灯星",a:"Single",d:"4:10",bvid:"",page:0},
        {t:"紙ひこうき",a:"Single",d:"4:05",bvid:"",page:0},
        {t:"若者のすべて",a:"Single",d:"4:15",bvid:"",page:0},
        {t:"Yu, Sansan",a:"Single",d:"3:30",bvid:"",page:0},
        {t:"昼鳶",a:"Single",d:"4:00",bvid:"",page:0},
        {t:"Bubble",a:"Single",d:"3:40",bvid:"",page:0},
        {t:"Madder",a:"Single",d:"3:30",bvid:"",page:0},
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
    let hasBvid = s => s.bvid && s.bvid.length > 5;

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

    // ---- 构建B站iframe URL ----
    function buildBiliUrl(s) {
        if (!hasBvid(s)) return null;
        let url = `https://player.bilibili.com/player.html?bvid=${s.bvid}&autoplay=1&danmaku=0&high_quality=1`;
        if (s.page && s.page > 1) url += `&page=${s.page}`;
        return url;
    }

    // ---- 加载歌曲 ----
    function loadSong(i) {
        if (i < 0 || i >= list.length) return;
        const s = list[i];
        idx = i;

        const burl = buildBiliUrl(s);
        if (burl) {
            yrkTrackTitle.textContent = '🎵 ' + s.t;
            yrkYtWrap.style.display = 'block';
            yrkYtFrame.src = burl;
        } else {
            // 无BV号 → 用搜索关键词
            yrkTrackTitle.textContent = '🔍 ' + s.t + ' (搜索中)';
            yrkYtWrap.style.display = 'block';
            yrkYtFrame.src = `https://player.bilibili.com/player.html?keyword=${encodeURIComponent('ヨルシカ '+s.t)}&autoplay=0&danmaku=0`;
            toast2(`🔍 "${s.t}" 暂未配置BV号，已搜索B站`);
        }

        yrkTrackMeta.textContent = s.a + ' · ' + s.d + (hasBvid(s) ? '' : ' · 需手动在B站播放');

        yrkTimeTotal.textContent = s.d;
        curTime = 0;
        yrkProgressFill.style.width = '0%';
        yrkTimeCurrent.textContent = '0:00';

        // 更新播放状态
        playing = true;
        yrkPlayIcon.className = 'fas fa-pause';
        yrkCover.classList.add('playing');
        musicToggle.classList.add('playing');

        startProg();
        renderPlaylist();
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

    // ---- 进度模拟 ----
    function startProg() {
        stopProg();
        progTimer = setInterval(() => {
            if (!playing) return;
            const tot = parseT(list[idx]?.d || '0:00');
            if (tot > 0) {
                curTime += 0.5;
                if (curTime >= tot) {
                    curTime = 0;
                    if (loop) { nextS(); return; }
                    else { playing = false; yrkPlayIcon.className = 'fas fa-play'; yrkCover.classList.remove('playing'); }
                }
                yrkProgressFill.style.width = Math.min(curTime/tot*100,100) + '%';
                yrkTimeCurrent.textContent = fmtT(curTime);
            }
        }, 500);
    }
    function stopProg() { if (progTimer) clearInterval(progTimer); }

    // ---- 播放/暂停 (B站靠iframe内部控制，这里用进度模拟) ----
    function playPause() {
        playing = !playing;
        if (playing) {
            yrkPlayIcon.className = 'fas fa-pause';
            yrkCover.classList.add('playing');
            musicToggle.classList.add('playing');
            startProg();
            // 尝试postMessage通知B站播放
            yrkYtFrame.contentWindow?.postMessage('{"event":"play"}', '*');
        } else {
            yrkPlayIcon.className = 'fas fa-play';
            yrkCover.classList.remove('playing');
            musicToggle.classList.remove('playing');
            stopProg();
            yrkYtFrame.contentWindow?.postMessage('{"event":"pause"}', '*');
        }
    }

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
                const miss = !hasBvid(s) ? 'miss' : '';
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

        const found = SONGS.findIndex(s => s.t.toLowerCase().includes(q.toLowerCase()));
        if (found >= 0) {
            list = [...SONGS];
            renderAlbumFilter();
            renderPlaylist();
            loadSong(found);
            toast2(`✅ 找到 "${SONGS[found].t}"`);
            return;
        }

        // B站搜索
        yrkYtWrap.style.display = 'block';
        yrkYtFrame.src = `https://player.bilibili.com/player.html?keyword=${encodeURIComponent('ヨルシカ '+q)}&autoplay=0&danmaku=0`;
        yrkTrackTitle.textContent = '🔍 搜索: ' + q;
        yrkTrackMeta.textContent = 'B站搜索结果';
        toast2(`🔍 B站搜索 "ヨルシカ ${q}"`);
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

    // ---- 进度条点击 (模拟) ----
    yrkProgressBar.addEventListener('click', e => {
        const r = yrkProgressBar.getBoundingClientRect();
        const pct = (e.clientX - r.left) / r.width;
        const tot = parseT(list[idx]?.d || '0:00');
        curTime = pct * tot;
        yrkProgressFill.style.width = pct * 100 + '%';
        yrkTimeCurrent.textContent = fmtT(curTime);
    });

    // ---- 音量 (UI only, B站iframe无法直接控制) ----
    yrkVolFill.style.width = vol + '%';
    yrkVolBar.addEventListener('click', e => {
        const r = yrkVolBar.getBoundingClientRect();
        vol = Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / r.width * 100)));
        yrkVolFill.style.width = vol + '%';
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

    // 自动加载第一首有BV号的歌
    const firstValid = SONGS.findIndex(hasBvid);
    if (firstValid >= 0) {
        loadSong(firstValid);
    }

    toast2('🦌 ヨルシカ 播放器就绪 (B站音源) · 按空格播放/暂停');

    // 暴露给全局
    window.yorushikaPlayer = { SONGS, loadSong, nextS, prevS, playPause, hasBvid };
})();
