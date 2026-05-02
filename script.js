/**
 * SHAQUIB_OS v4.2.0
 * Systems Architecture & Portfolio Logic
 * Revealing Module Pattern Implementation
 */

const App = (function () {
    // --- State & Constants ---
    const state = {
        bootProgress: 0,
        mouse: { x: 0, y: 0 },
        cursor: { x: 0, y: 0 },
        startTime: Date.now(),
        terminalHistory: [],
        isBooted: false
    };

    const config = {
        cursorEase: 0.12,
        particlesCount: 80,
        bootDuration: 2500,
        maxDist: 180
    };

    // --- DOM Elements ---
    const elements = {
        bootOverlay: document.getElementById('boot-sequence'),
        progressBar: document.getElementById('progress-bar'),
        bootLogs: document.getElementById('boot-logs'),
        cursorDot: document.getElementById('cursor-dot'),
        cursorRing: document.getElementById('cursor-ring'),
        header: document.getElementById('main-header'),
        scrollProgress: document.getElementById('scroll-progress'),
        canvas: document.getElementById('bg-canvas'),
        terminalInput: document.getElementById('terminal-input'),
        terminalHistory: document.getElementById('terminal-history'),
        terminalBody: document.getElementById('terminal-body'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabPanels: document.querySelectorAll('.tab-panel'),
        revealElements: document.querySelectorAll('.reveal'),
        magneticElements: document.querySelectorAll('.magnetic'),
        uptimeCounter: document.getElementById('uptime-counter'),
        currentTime: document.getElementById('current-time'),
        statCpu: document.getElementById('stat-cpu'),
        statMem: document.getElementById('stat-mem'),
        statPings: document.getElementById('stat-pings')
    };

    // --- Utility Functions ---
    const utils = {
        lerp: (a, b, n) => (1 - n) * a + n * b,
        randomRange: (min, max) => Math.random() * (max - min) + min,
        formatTime: (date) => date.toTimeString().split(' ')[0]
    };

    // --- Boot Sequence ---
    function initBootSequence() {
        const logs = elements.bootLogs.querySelectorAll('.log-line');
        let currentLog = 0;

        const logInterval = setInterval(() => {
            if (currentLog < logs.length) {
                logs[currentLog].style.opacity = '1';
                logs[currentLog].style.transform = 'translateX(0)';
                currentLog++;
            } else {
                clearInterval(logInterval);
            }
        }, 150);

        const progressInterval = setInterval(() => {
            state.bootProgress += Math.random() * 4;
            if (state.bootProgress >= 100) {
                state.bootProgress = 100;
                clearInterval(progressInterval);
                setTimeout(revealSite, 800);
            }
            elements.progressBar.style.width = `${state.bootProgress}%`;
        }, 60);
    }

    function revealSite() {
        elements.bootOverlay.style.opacity = '0';
        elements.bootOverlay.style.visibility = 'hidden';
        document.body.style.overflow = 'auto';
        state.isBooted = true;
        initRevealObserver();
    }

    // --- Custom Cursor ---
    function initCursor() {
        window.addEventListener('mousemove', (e) => {
            state.mouse.x = e.clientX;
            state.mouse.y = e.clientY;
        });

        function update() {
            elements.cursorDot.style.transform = `translate(${state.mouse.x}px, ${state.mouse.y}px)`;

            state.cursor.x = utils.lerp(state.cursor.x, state.mouse.x, config.cursorEase);
            state.cursor.y = utils.lerp(state.cursor.y, state.mouse.y, config.cursorEase);

            elements.cursorRing.style.transform = `translate(${state.cursor.x}px, ${state.cursor.y}px)`;

            requestAnimationFrame(update);
        }
        update();
    }

    // --- Neural Background ---
    function initCanvas() {
        const ctx = elements.canvas.getContext('2d');
        let particles = [];

        function resize() {
            elements.canvas.width = window.innerWidth;
            elements.canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * elements.canvas.width;
                this.y = Math.random() * elements.canvas.height;
                this.vx = utils.randomRange(-0.4, 0.4);
                this.vy = utils.randomRange(-0.4, 0.4);
                this.radius = utils.randomRange(0.5, 1.5);
            }
            update() {
                // Magnetic Pull interaction
                const dx = state.mouse.x - this.x;
                const dy = state.mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 250) {
                    const force = (250 - dist) / 2500;
                    this.vx += dx * force * 0.1;
                    this.vy += dy * force * 0.1;
                }

                this.vx *= 0.99;
                this.vy *= 0.99;
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > elements.canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > elements.canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 113, 255, 0.3)';
                ctx.fill();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

            // Grid lines
            ctx.strokeStyle = 'rgba(0, 113, 255, 0.02)';
            ctx.lineWidth = 0.5;
            const step = 60;
            for (let x = 0; x < elements.canvas.width; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, elements.canvas.height); ctx.stroke();
            }
            for (let y = 0; y < elements.canvas.height; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(elements.canvas.width, y); ctx.stroke();
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.maxDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 113, 255, ${(1 - dist / config.maxDist) * 0.12})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        for (let i = 0; i < config.particlesCount; i++) particles.push(new Particle());
        animate();
    }

    // --- System Status Updates ---
    function initSystemStats() {
        setInterval(() => {
            const uptime = Math.floor((Date.now() - state.startTime) / 1000);
            elements.uptimeCounter.innerText = uptime;
            elements.currentTime.innerText = utils.formatTime(new Date());

            if (elements.statCpu) {
                elements.statCpu.innerText = `${Math.floor(utils.randomRange(15, 45))}%`;
                elements.statMem.innerText = `${utils.randomRange(1.1, 1.4).toFixed(1)}GB`;
                elements.statPings.innerText = `${Math.floor(utils.randomRange(120, 180))}/s`;
            }
        }, 1000);
    }

    // --- Scroll & Reveal ---
    function initScrollTracking() {
        window.addEventListener('scroll', () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;

            elements.scrollProgress.style.width = `${scrolled}%`;

            if (winScroll > 100) {
                elements.header.classList.add('scrolled');
            } else {
                elements.header.classList.remove('scrolled');
            }
        });
    }

    function initRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        elements.revealElements.forEach(el => observer.observe(el));
    }

    // --- Terminal Control ---
    function initTerminal() {
        const history = [];
        let historyIndex = -1;

        const commands = {
            'help': 'CORE: [whoami, status, projects, audit, matrix, logs, clear]\nPOSIX: [ls, pwd, date, cat, node, npm]',
            'whoami': 'ENTITY: MD_SHAQUIB\nROLE: SENIOR_SYSTEMS_ARCHITECT\nEXP: 7_YEARS\nCLEARANCE: LEVEL_4\nCURRENT_NODE: DUBAI_CORE_01',
            'status': () => `KERNEL: SHAQUIB_v4.2.0\nUPTIME: ${Math.floor((Date.now() - state.startTime) / 1000)}s\nMEM_LOAD: 1.24GB/16.0GB\nNETWORK: TUNNEL_ACTIVE (AES-256)`,
            'ls': 'Documents/  Downloads/  Projects/  system_manifest.log  core_config.json',
            'pwd': '/home/md-shaquib/vault/core',
            'date': () => new Date().toString(),
            'node -v': 'v20.12.2',
            'node': 'v20.12.2',
            'npm -v': '10.5.0',
            'npm': '10.5.0',
            'cat': 'Usage: cat [file]. Try "cat system_manifest.log"',
            'cat system_manifest.log': 'SYSTEM_MANIFEST_v4.2.0\n[OK] RFID_MODULE_SYNC\n[OK] DB_CLUSTER_HEALTHY\n[OK] EDGE_NODES_ACTIVE',
            'projects': 'MOUNTED_DRIVES:\n/mnt/projects/rfid_logistics\n/mnt/projects/erp_v2\n/mnt/projects/smart_wash_iot',
            'audit': 'INITIATING_SYSTEM_AUDIT...\n[OK] ENCRYPTION_KEY_VALID\n[OK] DATABASE_REPLICATION_SYNCED\n[OK] RFID_GATES_OPERATIONAL\nRESULT: ALL_SYSTEMS_NOMINAL',
            'matrix': () => {
                const hex = '0123456789ABCDEF';
                let output = 'HEX_STREAM_INITIATED:\n';
                for (let i = 0; i < 4; i++) {
                    let line = '';
                    for (let j = 0; j < 32; j++) line += hex[Math.floor(Math.random() * 16)];
                    output += line + '\n';
                }
                return output;
            },
            'logs': 'FETCHING_RECENT_EVENTS:\n[2026-05-02 04:20] USER_AUTH: SUCCESS\n[2026-05-02 04:22] RFID_GATE_04: SYNC_COMPLETED\n[2026-05-02 04:25] KERNEL: OPTIMIZATION_ROUTINE_FINISHED',
            'clear': 'CLEAR',
            'exit': 'TERMINATING_SESSION... (ACCESS_DENIED)'
        };

        elements.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = elements.terminalInput.value.trim().toLowerCase();
                if (cmd) {
                    history.push(cmd);
                    historyIndex = history.length;
                    processCommand(cmd);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    elements.terminalInput.value = history[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    elements.terminalInput.value = history[historyIndex];
                } else {
                    historyIndex = history.length;
                    elements.terminalInput.value = '';
                }
            }

        });

        function processCommand(cmd) {
            if (cmd === 'clear') {
                elements.terminalHistory.innerHTML = '';
                elements.terminalInput.value = '';
                return;
            }

            const line = document.createElement('div');
            line.className = 'terminal-input-line';
            line.innerHTML = `<span class="terminal-prompt">></span> <span style="color: #fff">${cmd}</span>`;
            elements.terminalHistory.appendChild(line);

            const response = document.createElement('div');
            response.className = 'terminal-output';
            response.style.color = '#fff';

            let result = commands[cmd];
            if (typeof result === 'function') result = result();

            response.innerText = result || `ERR: COMMAND_NOT_FOUND: ${cmd}`;
            elements.terminalHistory.appendChild(response);

            elements.terminalInput.value = '';
            elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;
        }

        // Initial Welcome Message
        const welcome = document.createElement('div');
        welcome.className = 'terminal-output';
        welcome.style.color = 'var(--accent-cyan)';
        welcome.style.marginBottom = '20px';
        welcome.innerText = 'SHAQUIB_OS v4.2.0 (STABLE_BUILD)\nTYPE "help" FOR SYSTEM_COMMANDS\n--------------------------------';
        elements.terminalHistory.appendChild(welcome);

        // Auto-focus terminal on click
        elements.terminalBody.addEventListener('click', () => elements.terminalInput.focus());
    }


    // --- Interaction Hooks ---
    function initTabs() {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');
                elements.tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                elements.tabPanels.forEach(p => {
                    p.classList.remove('active');
                    if (p.id === target) p.classList.add('active');
                });
            });
        });
    }

    function initMagneticEffect() {
        elements.magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }

    // --- Initialization ---
    return {
        init: function () {
            document.body.style.overflow = 'hidden';
            initBootSequence();
            initCursor();
            initCanvas();
            initSystemStats();
            initScrollTracking();
            initTerminal();
            initTabs();
            initMagneticEffect();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
