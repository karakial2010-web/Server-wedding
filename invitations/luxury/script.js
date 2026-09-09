// ---------- فتح الدعوة ----------
function openInvitation() {
    const env = document.querySelector('.envelope');
    env.classList.add('open');

    setTimeout(() => {
        document.getElementById('envelopeScreen').classList.add('fade-out');
        const invite = document.getElementById('invitation');
        invite.classList.add('visible');
        document.body.style.overflow = 'hidden';
        document.querySelector('.music-btn').style.opacity = '1';
        document.querySelector('.music-btn').style.pointerEvents = 'auto';
        startCountdown();
        addReveals();
    }, 800);
}

// ---------- العد التنازلي ----------
function startCountdown() {
    const target = new Date('September 24, 2026 19:00:00').getTime();
    const d = (n) => String(n).padStart(2, '0');

    const update = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        document.getElementById('days').textContent = d(Math.floor(diff / 86400000));
        document.getElementById('hours').textContent = d(Math.floor(diff % 86400000 / 3600000));
        document.getElementById('minutes').textContent = d(Math.floor(diff % 3600000 / 60000));
        document.getElementById('seconds').textContent = d(Math.floor(diff % 60000 / 1000));
    };
    update();
    setInterval(update, 1000);
}

// ---------- ظهور تدريجي ----------
function addReveals() {
    const els = document.querySelectorAll('#invitation .slide > *:not(.scroll-cue)');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    els.forEach((el) => {
        el.classList.add('reveal');
        io.observe(el);
    });

    // بطاقات البرنامج تظهر واحدة تلو الأخرى عند التمرير
    const cards = document.querySelectorAll('.prog-card');
    cards.forEach((card, i) => {
        card.classList.add('reveal');
        card.style.transitionDelay = (0.15 * i) + 's';
        io.observe(card);
    });
}

// ---------- تخصيص الأسماء (بأحرف محفورة) ----------
const namesBtn = document.getElementById('namesBtn');
const namesPanel = document.getElementById('namesPanel');
if (namesBtn && namesPanel) {
    namesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        namesPanel.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (namesPanel.classList.contains('open') &&
            !namesPanel.contains(e.target) &&
            e.target !== namesBtn &&
            !namesBtn.contains(e.target)) {
            namesPanel.classList.remove('open');
        }
    });
    document.getElementById('namesApply').addEventListener('click', () => {
        const groom = document.getElementById('editGroom').value.trim();
        const bride = document.getElementById('editBride').value.trim();
        if (!groom || !bride) return;
        const gI = Array.from(groom)[0].toUpperCase();
        const bI = Array.from(bride)[0].toUpperCase();
        document.querySelector('.couple-ar').innerHTML = bride + ' <span class="amp">&amp;</span> ' + groom;
        document.querySelectorAll('.env-calligraphy, .footer-calligraphy').forEach((el) => (el.textContent = bI + ' & ' + gI));
        document.querySelectorAll('.seal-txt').forEach((el) => (el.textContent = gI + ' & ' + bI));
        document.title = 'دعوة زفاف | ' + bride + ' و' + groom;
        namesPanel.classList.remove('open');
    });
}

// ---------- الموسيقى (نغمات لطيفة عبر Web Audio) ----------
const musicBtn = document.getElementById('musicBtn');
let audioCtx = null;
let musicOn = false;
let musicTimer = null;

const NOTES = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25];

function playNote(freq, time, dur = 1.4, vol = 0.12) {
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
}

function playMelody() {
    if (!audioCtx || !musicOn) return;
    const now = audioCtx.currentTime;
    let t = now + 0.1;
    NOTES.forEach((n) => {
        playNote(n, t);
        playNote(n * 0.5, t, 1.4, 0.06); // نغمة أوكتاف منخفضة
        t += 0.55;
    });
    musicTimer = setTimeout(playMelody, 4000);
}

musicBtn.addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    musicOn = !musicOn;
    if (musicOn) {
        musicBtn.textContent = '🎵';
        musicBtn.classList.add('playing');
        playMelody();
    } else {
        clearTimeout(musicTimer);
        musicBtn.classList.remove('playing');
    }
});

// ---------- نموذج تأكيد الحضور ----------
document.getElementById('rsvpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const answer = document.getElementById('guestAttendance').value;
    const msg = document.getElementById('formMessage');

    if (answer === 'yes') {
        msg.textContent = 'شكراً ' + name + '، يسعدنا حضوركم وبانتظاركم! ❤';
    } else {
        msg.textContent = 'شكراً ' + name + '، ستفقدنا فرحة حضوركم، ونشكر اهتمامكم.';
    }
    e.target.reset();
    setTimeout(() => (msg.textContent = ''), 6000);
});