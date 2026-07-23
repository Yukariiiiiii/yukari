// ===== MyGo!!!!!! 个人博客 - 交互脚本 =====

document.addEventListener('DOMContentLoaded', () => {
    // 1. 滚动渐入动画
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

    // 给文章卡片和侧边栏组件添加渐入效果
    const animatedElements = document.querySelectorAll('.article-card, .sidebar-widget, .banner');
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // 2. 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(126, 200, 160, 0.2)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(126, 200, 160, 0.12)';
            navbar.style.background = 'rgba(255, 255, 255, 0.92)';
        }
        
        lastScroll = currentScroll;
    });

    // 3. 文章卡片点击效果
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // 模拟页面跳转效果
            if (!e.target.classList.contains('card-readmore')) {
                const readmore = card.querySelector('.card-readmore');
                if (readmore) {
                    // 添加点击波纹效果
                    createRipple(e, card);
                }
            }
        });
    });

    // 4. 波纹效果
    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(126, 200, 160, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // 添加 ripple 动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 5. 标签点击效果
    const tags = document.querySelectorAll('.cloud-tag, .tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 移除其他标签的 active 状态
            tags.forEach(t => t.style.background = '');
            // 高亮当前标签
            this.style.background = 'var(--mygo-green)';
            this.style.color = '#fff';
            
            // 模拟筛选效果
            const tagText = this.textContent;
            console.log(`筛选标签: ${tagText}`);
        });
    });

    // 6. 导航链接激活状态
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 7. 动态生成背景音符
    function createFloatingNote() {
        const notes = ['♪', '♫', '♩', '♬', '♭', '♮'];
        const colors = ['var(--mygo-green)', 'var(--mygo-pink)', 'var(--mygo-blue)', 'var(--mygo-yellow)', 'var(--mygo-purple)'];
        
        const note = document.createElement('span');
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: 100%;
            font-size: ${14 + Math.random() * 20}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            opacity: 0.08;
            pointer-events: none;
            z-index: 0;
            animation: floatUp ${10 + Math.random() * 10}s linear forwards;
        `;
        
        document.querySelector('.bg-notes').appendChild(note);
        
        setTimeout(() => note.remove(), 20000);
    }

    // 每3秒生成一个新音符
    setInterval(createFloatingNote, 3000);

    // 8. 鼓图标点击彩蛋
    const drumIcon = document.querySelector('.drum-icon');
    if (drumIcon) {
        let clickCount = 0;
        const messages = [
            '咚！',
            '咚咚！',
            'MyGo!!!!!!',
            '鼓点来了！',
            '声を届けたい！',
            '君は MyGo のファン？'
        ];
        
        drumIcon.addEventListener('click', () => {
            clickCount++;
            const msg = messages[clickCount % messages.length];
            
            // 创建提示气泡
            const bubble = document.createElement('div');
            bubble.textContent = msg;
            bubble.style.cssText = `
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--mygo-green);
                color: #fff;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                white-space: nowrap;
                animation: fadeUp 1.5s ease forwards;
                z-index: 10;
            `;
            
            drumIcon.parentElement.style.position = 'relative';
            drumIcon.parentElement.appendChild(bubble);
            
            setTimeout(() => bubble.remove(), 1500);
            
            // 添加震动效果
            drumIcon.style.animation = 'none';
            setTimeout(() => {
                drumIcon.style.animation = 'drumPulse 0.3s ease 3';
            }, 10);
        });
    }

    // 添加 fadeUp 动画
    const style2 = document.createElement('style');
    style2.textContent = `
        @keyframes fadeUp {
            0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(-5px); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;
    document.head.appendChild(style2);

    // 9. 鼠标跟随音符效果
    let mouseTrail = [];
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.92) {
            const trail = document.createElement('span');
            trail.textContent = '♪';
            trail.style.cssText = `
                position: fixed;
                left: ${e.clientX + (Math.random() - 0.5) * 20}px;
                top: ${e.clientY + (Math.random() - 0.5) * 20}px;
                font-size: ${10 + Math.random() * 8}px;
                color: var(--mygo-green);
                opacity: 0.3;
                pointer-events: none;
                z-index: 9999;
                animation: trailFade 1s ease forwards;
            `;
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 1000);
        }
    });

    const style3 = document.createElement('style');
    style3.textContent = `
        @keyframes trailFade {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.5) translateY(-20px); }
        }
    `;
    document.head.appendChild(style3);

    // 10. 时间问候语
    const now = new Date();
    const hour = now.getHours();
    let greeting = '晚上好';
    if (hour < 6) greeting = '凌晨好';
    else if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    
    console.log(`%c${greeting}！欢迎来到 MyGo!!!!!! 个人博客 🥁`, 
        'color: #7ec8a0; font-size: 16px; font-weight: bold;');
});
