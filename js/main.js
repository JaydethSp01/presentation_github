(function () {
            'use strict';

            /* ===== SLIDE DATA ===== */
            const slides = Array.from(document.querySelectorAll('.slide'));
            const total = slides.length;
            let current = 0;
            let isAnimating = false;

            /* ===== DOM REFS ===== */
            const dotsContainer = document.getElementById('dots');
            const progressBar = document.getElementById('progress');
            const curNumEl = document.getElementById('cur-num');
            const totNumEl = document.getElementById('tot-num');
            const btnPrev = document.getElementById('nav-prev');
            const btnNext = document.getElementById('nav-next');

            /* ===== INIT DOTS ===== */
            totNumEl.textContent = total;
            slides.forEach((_, i) => {
                const d = document.createElement('div');
                d.className = 'dot' + (i === 0 ? ' active' : '');
                d.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(d);
            });

            function updateUI() {
                // Dots
                document.querySelectorAll('.dot').forEach((d, i) => {
                    d.classList.toggle('active', i === current);
                });
                // Counter
                curNumEl.textContent = current + 1;
                // Progress
                progressBar.style.width = ((current / (total - 1)) * 100) + '%';
                // Buttons
                btnPrev.disabled = current === 0;
                btnNext.disabled = current === total - 1;
            }

            function goTo(index) {
                if (isAnimating || index === current || index < 0 || index >= total) return;
                isAnimating = true;

                const direction = index > current ? 1 : -1;
                const prev = current;
                current = index;

                // Set starting positions
                slides[current].style.transform = `translateX(${direction * 100}%)`;
                slides[current].style.opacity = '0';
                slides[current].classList.remove('prev', 'active');

                // Force reflow
                slides[current].offsetHeight;

                // Animate out old slide
                slides[prev].classList.remove('active');
                slides[prev].classList.add('prev');

                // Animate in new slide
                slides[current].classList.add('active');
                slides[current].style.transform = '';
                slides[current].style.opacity = '';

                updateUI();

                setTimeout(() => {
                    slides[prev].classList.remove('prev');
                    isAnimating = false;
                }, 600);
            }

            function next() { goTo(current + 1); }
            function prev() { goTo(current - 1); }

            btnNext.addEventListener('click', next);
            btnPrev.addEventListener('click', prev);

            /* ===== KEYBOARD ===== */
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next(); }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
            });

            /* ===== TOUCH SWIPE ===== */
            let touchStartX = 0;
            document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
            document.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
            });

            /* ===== CUSTOM CURSOR ===== */
            const curDot = document.getElementById('cur-dot');
            const curRing = document.getElementById('cur-ring');
            if (window.matchMedia('(min-width:769px)').matches) {
                document.addEventListener('mousemove', (e) => {
                    curDot.style.left = e.clientX + 'px';
                    curDot.style.top = e.clientY + 'px';
                    curRing.animate({ left: e.clientX + 'px', top: e.clientY + 'px' }, { duration: 400, fill: 'forwards' });
                });
            }

            /* ===== ACCORDION ===== */
            document.querySelectorAll('.acc-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.parentElement;
                    const content = item.querySelector('.acc-content');
                    const isOpen = item.classList.contains('open');

                    // Close all
                    document.querySelectorAll('.acc-item.open').forEach(i => {
                        i.classList.remove('open');
                        i.querySelector('.acc-content').style.maxHeight = null;
                    });

                    if (!isOpen) {
                        item.classList.add('open');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });

            /* ===== PARTICLES CANVAS ===== */
            function initParticles(canvasId) {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');

                function resize() {
                    canvas.width = canvas.parentElement.offsetWidth;
                    canvas.height = canvas.parentElement.offsetHeight;
                }
                resize();
                window.addEventListener('resize', resize);

                const particles = [];
                const count = Math.floor((canvas.width * canvas.height) / 14000);

                for (let i = 0; i < count; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: Math.random() * 1.8 + 0.5,
                        dx: (Math.random() - 0.5) * 0.6,
                        dy: (Math.random() - 0.5) * 0.6,
                    });
                }

                function draw() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    particles.forEach(p => {
                        p.x += p.dx; p.y += p.dy;
                        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(249,115,22,0.25)';
                        ctx.fill();
                    });
                    // Connect nearby particles
                    for (let i = 0; i < particles.length; i++) {
                        for (let j = i + 1; j < particles.length; j++) {
                            const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                            if (dist < 120) {
                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(249,115,22,${0.08 * (1 - dist / 120)})`;
                                ctx.lineWidth = 0.8;
                                ctx.moveTo(particles[i].x, particles[i].y);
                                ctx.lineTo(particles[j].x, particles[j].y);
                                ctx.stroke();
                            }
                        }
                    }
                    requestAnimationFrame(draw);
                }
                draw();
            }

            initParticles('hero-canvas');
            initParticles('outro-canvas');

            /* ===== INIT ===== */
            updateUI();

        })();
