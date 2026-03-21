/**
 * PRAGYOTSAV 2K26 — MOBILE-OPTIMIZED ENGINE
 * Touch-first, gyroscope spores, tap modals,
 * reduced motion respect, 60fps on low-end phones
 */

const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const IS_MOBILE = window.innerWidth < 768 || IS_TOUCH;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════
   PIN DATA (Hawkins Map)
═══════════════════════════════════════ */
/* PIN_DATA removed — now using "details" object in section 6 */

/* ═══════════════════════════════════════
   1. GLITCH INTRO
═══════════════════════════════════════ */
(function glitchIntro() {
    // Delay until "You Have Been Chosen" screen finishes (~5.4s total)
    const CHOSEN_DURATION = 5400;

    const overlay = document.getElementById('glitch-overlay');
    const gc = document.getElementById('glitch-canvas');
    if (!gc) return;

    // Hide glitch overlay until chosen screen is done
    overlay.style.display = 'none';
    setTimeout(() => { overlay.style.display = ''; }, CHOSEN_DURATION);

    const gctx = gc.getContext('2d');
    const gl1 = document.getElementById('gl1');
    const gl3 = document.getElementById('gl3');
    let frame = 0, stopped = false;

    function resize() { gc.width = window.innerWidth; gc.height = window.innerHeight; }
    resize();

    const bars = Array.from({length: IS_MOBILE ? 8 : 12}, () => ({
        y: Math.random() * window.innerHeight,
        h: Math.random() * 5 + 2,
        x: (Math.random() - 0.5) * 30,
        speed: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2
    }));

    function draw() {
        if (stopped) return;
        frame++;
        gctx.clearRect(0, 0, gc.width, gc.height);
        for (let y = 0; y < gc.height; y += 4) {
            gctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.05})`;
            gctx.fillRect(0, y, gc.width, 1);
        }
        bars.forEach(b => {
            b.y += b.speed; if (b.y > gc.height) b.y = -b.h;
            gctx.fillStyle = `rgba(${170 + Math.random()*40},${Math.random()*15},${Math.random()*12},${b.alpha})`;
            gctx.fillRect(b.x, b.y, gc.width * (0.3 + Math.random() * 0.7), b.h);
        });
        if (Math.random() > 0.65) {
            const ry = Math.random() * gc.height;
            gctx.fillStyle = 'rgba(255,0,0,0.07)'; gctx.fillRect(-6, ry, gc.width, 2);
            gctx.fillStyle = 'rgba(0,0,200,0.07)'; gctx.fillRect(6, ry+1, gc.width, 2);
        }
        const pct = Math.min(frame / 80, 1);
        const b = Math.floor(pct * 10);
        gl3.textContent = '■'.repeat(b) + '░'.repeat(10 - b) + ` ${Math.floor(pct*100)}%`;
        if (frame % 8 === 0) gl1.classList.toggle('gl-glitch');
        requestAnimationFrame(draw);
    }
    // Start glitch after chosen screen (5.4s) + run for 2.2s
    setTimeout(() => {
        draw();
        const dur = IS_MOBILE ? 2000 : 2400;
        setTimeout(() => {
            stopped = true;
            overlay.classList.add('fade-out');
            document.body.classList.remove('loading');
            setTimeout(() => { overlay.remove(); }, 600);
            startMorseTypewriter();
        }, dur);
    }, 5400);
})();

/* ═══════════════════════════════════════
   2. MORSE TYPEWRITER
═══════════════════════════════════════ */
function startMorseTypewriter() {
    AOS.init({ duration: IS_MOBILE ? 800 : 1000, once: false, mirror: true, offset: 40, easing: 'ease-out-cubic', disable: REDUCED ? 'all' : false });

    const el = document.getElementById('hero-tagline');
    if (!el || REDUCED) {
        if (el) el.textContent = '"Enter the Upside Down of Technology"';
        return;
    }
    const final = '"Enter the Upside Down of Technology"';
    const morseMap = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',' ':' ','"':"'"};
    const morse = final.toUpperCase().split('').map(c => morseMap[c] || c).join(' ');
    let i = 0;

    function typeMorse() {
        if (i <= morse.length) {
            el.innerHTML = `<span style="opacity:.5;letter-spacing:.12em">${morse.slice(0,i)}</span><span class="cursor-blink"></span>`;
            i++; setTimeout(typeMorse, 18);
        } else {
            setTimeout(decode, 350);
        }
    }
    function decode() {
        let iter = 0; const max = 16;
        const chars = '.-_ ';
        const id = setInterval(() => {
            const rev = Math.floor((iter / max) * final.length);
            let d = '';
            for (let j = 0; j < final.length; j++) {
                d += j < rev ? final[j] : chars[Math.floor(Math.random() * chars.length)];
            }
            el.innerHTML = `${d}<span class="cursor-blink"></span>`;
            iter++;
            if (iter >= max) {
                clearInterval(id);
                el.innerHTML = final + '<span class="cursor-blink"></span>';
                setTimeout(() => { el.textContent = final; }, 1800);
            }
        }, 75);
    }
    setTimeout(typeMorse, 600);
}

/* ═══════════════════════════════════════
   3. SCENE CANVAS (Day→Night on scroll)
═══════════════════════════════════════ */
const sceneCanvas = document.getElementById('scene-canvas');
const sc = sceneCanvas.getContext('2d');
let W = 0, H = 0, scrollY = 0, scrollVel = 0, lastSY = 0;
let sceneT = 0, lightningTimer = 180, lightningA = 0, demoPhase = 0;

function resizeScene() {
    W = sceneCanvas.width  = window.innerWidth;
    H = sceneCanvas.height = window.innerHeight;
}
resizeScene();
window.addEventListener('resize', resizeScene, { passive: true });

function drawScene() {
    sceneT++;
    sc.clearRect(0, 0, W, H);
    const maxS = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const t = Math.min(scrollY / (maxS * 0.45), 1);

    drawSkyFX(t);
    drawMoon(t);
    drawForest(t);
    drawGround(t);
    drawRoad(t);
    drawDemo(t);
    drawRiders();
    requestAnimationFrame(drawScene);
}
drawScene();

function drawSkyFX(t) {
    lightningTimer--;
    if (lightningTimer <= 0) {
        lightningA = (0.03 + Math.random() * 0.05) * (1 + t * 2);
        lightningTimer = Math.random() * (280 - t * 180) + 55;
    }
    lightningA *= 0.91;
    if (lightningA > 0.004) {
        const lg = sc.createRadialGradient(W*.7, H*.1, 0, W*.7, H*.1, W*.38);
        lg.addColorStop(0, `rgba(180,60,20,${lightningA})`); lg.addColorStop(1, 'transparent');
        sc.fillStyle = lg; sc.fillRect(0, 0, W, H * .6);
    }
    for (let i = 0; i < 3; i++) {
        const ay = H * (.55 + i * .04) + Math.sin(sceneT * .0003 + i * 1.5) * 7;
        const ag = sc.createLinearGradient(0, ay-10, 0, ay+10);
        ag.addColorStop(0, 'transparent');
        ag.addColorStop(.5, `rgba(${60+t*35},0,${5+t*12},${(.055+t*.07)-i*.014})`);
        ag.addColorStop(1, 'transparent');
        sc.fillStyle = ag; sc.fillRect(0, ay-10, W, 20);
    }
}

function drawMoon(t) {
    const mx = W * .72, my = H * (.22 - t * .04) + Math.sin(sceneT * .0004) * 3;
    const mr = Math.max(32, Math.min(W * .06, 60));
    for (let i = 3; i >= 1; i--) {
        const g = sc.createRadialGradient(mx, my, mr*.8, mx, my, mr+i*18);
        g.addColorStop(0, `rgba(${60+t*35},0,${5+t*8},${(.065/i)*(1+t)})`); g.addColorStop(1, 'transparent');
        sc.beginPath(); sc.arc(mx, my, mr+i*18, 0, Math.PI*2); sc.fillStyle=g; sc.fill();
    }
    const mg = sc.createRadialGradient(mx-mr*.3, my-mr*.3, mr*.05, mx, my, mr);
    mg.addColorStop(0, `rgb(${42+t*18},${8-t*3},8)`);
    mg.addColorStop(.5, `rgb(${26-t*4},3,5)`);
    mg.addColorStop(1, 'rgb(13,1,8)');
    sc.beginPath(); sc.arc(mx, my, mr, 0, Math.PI*2); sc.fillStyle=mg; sc.fill();
    sc.beginPath(); sc.arc(mx, my, mr, 0, Math.PI*2);
    sc.strokeStyle=`rgba(${180+t*18},${20-t*8},10,${.22+t*.18})`; sc.lineWidth=1.2; sc.stroke();
}

function drawForest(t) {
    const gy = H * .78;
    const sw = Math.sin(sceneT * (.0006 + t * .0003)) * (1.2 + t * 1.4);
    const c3 = `rgba(${8},${2+(1-t)*4},4,${.65+t*.28})`;
    const c2 = `rgba(5,${1+(1-t)*2},3,${.82+t*.14})`;
    drawTL(gy+28, .55, c3, IS_MOBILE?12:18, 1.0, 0,  sw*.3);
    drawTL(gy+12, .75, c2, IS_MOBILE?10:14, 1.3, 7,  sw*.6);
    drawTL(gy,    1.0, 'rgba(2,0,2,0.97)', IS_MOBILE?8:11, 1.7, 17, sw);
}

function drawTL(baseY, scale, color, count, hm, seed, sway) {
    sc.fillStyle = color; sc.beginPath(); sc.moveTo(0, baseY);
    const sp = W / count;
    for (let i = 0; i <= count; i++) {
        const x = i*sp + (((seed*37+i*97)%100)/100-.5)*sp*.4;
        const tH = (60+((seed*53+i*71)%80))*scale*hm;
        const tW = (16+((seed*29+i*43)%26))*scale;
        drawT(x+sway, baseY, tH, tW);
    }
    sc.lineTo(W, baseY); sc.closePath(); sc.fill();
}

function drawT(x, baseY, h, w) {
    sc.moveTo(x,baseY); sc.lineTo(x-w*.5,baseY); sc.lineTo(x-w*.3,baseY-h*.35);
    sc.lineTo(x-w*.44,baseY-h*.35); sc.lineTo(x-w*.21,baseY-h*.62);
    sc.lineTo(x-w*.34,baseY-h*.62); sc.lineTo(x-w*.1,baseY-h*.82);
    sc.lineTo(x,baseY-h);
    sc.lineTo(x+w*.1,baseY-h*.82); sc.lineTo(x+w*.34,baseY-h*.62);
    sc.lineTo(x+w*.21,baseY-h*.62); sc.lineTo(x+w*.44,baseY-h*.35);
    sc.lineTo(x+w*.3,baseY-h*.35); sc.lineTo(x+w*.5,baseY);
}

function drawGround(t) {
    const gy = H*.78;
    const g = sc.createLinearGradient(0,gy,0,H);
    g.addColorStop(0,`rgba(${3+t*2},0,${2+t*2},0.98)`); g.addColorStop(1,'rgba(2,0,1,1)');
    sc.fillStyle=g; sc.fillRect(0,gy,W,H-gy);
    for (let i=0;i<3;i++) {
        const gm=sc.createRadialGradient(W*(.2+i*.3)+Math.sin(sceneT*.0003+i)*16,gy+4,0,W*(.2+i*.3),gy+4,W*.2);
        gm.addColorStop(0,`rgba(${55+t*25},0,${5+t*8},${.055+t*.04})`); gm.addColorStop(1,'transparent');
        sc.beginPath(); sc.ellipse(W*(.2+i*.3)+Math.sin(sceneT*.0003+i)*16,gy+6,W*.2,28,0,0,Math.PI*2);
        sc.fillStyle=gm; sc.fill();
    }
}

function drawRoad(t) {
    const ry=H*.82;
    const g=sc.createLinearGradient(0,ry,0,H);
    g.addColorStop(0,`rgba(${6+t*3},3,${4+t*3},0.9)`); g.addColorStop(1,'rgba(4,2,3,0.95)');
    sc.fillStyle=g; sc.beginPath(); sc.moveTo(0,ry); sc.lineTo(W,ry); sc.lineTo(W,H); sc.lineTo(0,H); sc.closePath(); sc.fill();
    sc.setLineDash([25,22]); sc.strokeStyle=`rgba(${75+t*18},40,${38+t*18},${.16+t*.08})`; sc.lineWidth=1.5;
    sc.beginPath(); sc.moveTo(0,H*.874); sc.lineTo(W,H*.874); sc.stroke(); sc.setLineDash([]);
}

function drawDemo(t) {
    if (t < 0.05) return;
    demoPhase += .0008;
    const bob = Math.sin(demoPhase)*7;
    const rise = Math.min(t*3, 1);
    const s = (IS_MOBILE ? 0.45 : 0.8) * rise;
    const dx = W*.14, dy = H*(.58+(1-rise)*.22)+bob;
    sc.save(); sc.translate(dx,dy); sc.scale(s,s); sc.globalAlpha = rise*(.22+Math.sin(demoPhase*1.4)*.04);
    const aura=sc.createRadialGradient(0,-28,8,0,-28,90);
    aura.addColorStop(0,`rgba(${80+t*35},0,${5+t*12},.16)`); aura.addColorStop(1,'transparent');
    sc.fillStyle=aura; sc.beginPath(); sc.arc(0,-28,90,0,Math.PI*2); sc.fill();
    sc.fillStyle='rgba(4,0,2,.88)';
    sc.beginPath(); sc.ellipse(0,0,35,50,0,0,Math.PI*2); sc.fill();
    sc.beginPath(); sc.arc(0,-55,30,0,Math.PI*2); sc.fill();
    for (let p=0;p<6;p++) {
        const ang=(p/6)*Math.PI*2-Math.PI/2;
        sc.beginPath(); sc.ellipse(Math.cos(ang)*25,-55+Math.sin(ang)*25,12,20,ang,0,Math.PI*2); sc.fill();
    }
    const v=sc.createRadialGradient(0,-55,0,0,-55,22);
    v.addColorStop(0,'rgba(0,0,0,.9)'); v.addColorStop(1,'transparent');
    sc.fillStyle=v; sc.beginPath(); sc.arc(0,-55,22,0,Math.PI*2); sc.fill();
    sc.fillStyle='rgba(4,0,2,.88)';
    [[-1,-.3],[1,-.3],[-1.2,0],[1.2,0]].forEach(([ax,ay])=>{
        const sw=Math.sin(demoPhase+ax)*5;
        sc.beginPath(); sc.moveTo(ax*28,ay*26);
        sc.bezierCurveTo(ax*55+sw,ay*26-28,ax*82+sw*2,18+sw,ax*100+sw*3,36+sw*2);
        sc.lineTo(ax*96,40); sc.bezierCurveTo(ax*72,20,ax*50,-26,ax*24,ay*26); sc.closePath(); sc.fill();
    });
    sc.restore();
}

function drawRiders() {
    const ry = H*.836;
    [[.29,1.1,0],[.44,1.05,.8],[.57,1.15,1.6]].forEach(([xp,s,ph])=>{
        const bob=Math.sin(sceneT*.08+ph)*1.4;
        const x=W*xp;
        drawBike(x,ry+bob,s,.9);
        if (xp===.29) drawBeam(x+20*s,ry-24*s+bob);
    });
    [[.64,.5,.48],[.71,.44,.36]].forEach(([xp,s,a])=>drawBike(W*xp,ry,s,a));
}

function drawBike(x,y,scale,alpha) {
    sc.save(); sc.translate(x,y); sc.scale(scale,scale); sc.globalAlpha=alpha;
    sc.lineWidth=3.2; sc.strokeStyle='rgba(0,0,0,.95)';
    sc.beginPath(); sc.arc(-26,13,18,0,Math.PI*2); sc.stroke();
    sc.beginPath(); sc.arc(26,13,18,0,Math.PI*2); sc.stroke();
    for (let a=0;a<Math.PI*2;a+=Math.PI/4) {
        sc.lineWidth=.7;
        sc.beginPath(); sc.moveTo(-26+Math.cos(a)*5,13+Math.sin(a)*5); sc.lineTo(-26+Math.cos(a)*17,13+Math.sin(a)*17); sc.stroke();
        sc.beginPath(); sc.moveTo(26+Math.cos(a)*5,13+Math.sin(a)*5); sc.lineTo(26+Math.cos(a)*17,13+Math.sin(a)*17); sc.stroke();
    }
    sc.lineWidth=3.2;
    sc.beginPath(); sc.moveTo(-26,13); sc.lineTo(2,-8); sc.stroke();
    sc.beginPath(); sc.moveTo(-26,13); sc.lineTo(28,13); sc.stroke();
    sc.beginPath(); sc.moveTo(2,-8); sc.lineTo(26,13); sc.stroke();
    sc.beginPath(); sc.moveTo(2,-8); sc.lineTo(2,13); sc.stroke();
    sc.beginPath(); sc.moveTo(17,-6); sc.lineTo(26,13); sc.stroke();
    sc.lineWidth=2.2;
    sc.beginPath(); sc.moveTo(2,-8); sc.lineTo(18,-8); sc.stroke();
    sc.beginPath(); sc.moveTo(18,-8); sc.lineTo(21,-14); sc.stroke();
    sc.beginPath(); sc.moveTo(19,-14); sc.lineTo(23,-14); sc.stroke();
    sc.lineWidth=2;
    sc.beginPath(); sc.moveTo(2,-8); sc.lineTo(2,-15); sc.stroke();
    sc.beginPath(); sc.moveTo(-3,-15); sc.lineTo(7,-15); sc.stroke();
    sc.fillStyle='rgba(0,0,0,.95)';
    sc.beginPath(); sc.moveTo(0,-15); sc.lineTo(13,-24); sc.lineTo(15,-20); sc.lineTo(3,-11); sc.closePath(); sc.fill();
    sc.beginPath(); sc.arc(14,-27,6.5,0,Math.PI*2); sc.fill();
    sc.beginPath(); sc.arc(6,-20,5,0,Math.PI*2); sc.fill();
    sc.lineWidth=3.5; sc.strokeStyle='rgba(0,0,0,.95)';
    sc.beginPath(); sc.moveTo(13,-24); sc.lineTo(21,-13); sc.stroke();
    sc.lineWidth=3;
    sc.beginPath(); sc.moveTo(2,-11); sc.lineTo(-7,2); sc.stroke();
    sc.beginPath(); sc.moveTo(-7,2); sc.lineTo(-5,13); sc.stroke();
    sc.beginPath(); sc.moveTo(2,-11); sc.lineTo(9,3); sc.stroke();
    sc.beginPath(); sc.moveTo(9,3); sc.lineTo(7,13); sc.stroke();
    sc.restore();
}

function drawBeam(x,y) {
    sc.save(); sc.translate(x,y);
    const fg=sc.createRadialGradient(0,0,0,0,0,230);
    fg.addColorStop(0,'rgba(255,230,200,0.08)'); fg.addColorStop(.4,'rgba(255,210,180,0.03)'); fg.addColorStop(1,'transparent');
    sc.fillStyle=fg; sc.beginPath(); sc.moveTo(0,0); sc.arc(0,0,230,-.2,.2); sc.closePath(); sc.fill();
    sc.restore();
}

/* ═══════════════════════════════════════
   4. SPORE PARTICLES (gyro on mobile)
═══════════════════════════════════════ */
(function initSpores() {
    const sc2 = document.getElementById('spore-canvas');
    const ctx = sc2.getContext('2d');
    let sW = window.innerWidth, sH = window.innerHeight;
    sc2.width = sW; sc2.height = sH;
    let mouseX = sW/2, mouseY = sH/2;
    let gyroX = 0, gyroY = 0;
    const COUNT = IS_MOBILE ? 45 : 80;

    if (IS_TOUCH) {
        window.addEventListener('deviceorientation', e => {
            gyroX = (e.gamma||0)/30;
            gyroY = (e.beta||0)/45;
        }, { passive:true });
    } else {
        document.addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; }, { passive:true });
    }

    const spores = Array.from({length:COUNT}, ()=>({
        x:Math.random()*sW, y:Math.random()*sH,
        vx:(Math.random()-.5)*.14, vy:-(Math.random()*.28+.06),
        r:Math.random()*1.4+.3,
        op:Math.random()*.38+.07,
        phase:Math.random()*Math.PI*2,
        hue:['rgba(165,25,210,','rgba(250,30,12,','rgba(235,175,55,','rgba(90,0,150,'][Math.floor(Math.random()*4)]
    }));

    function anim() {
        ctx.clearRect(0,0,sW,sH);
        const boost = 1 + Math.abs(scrollVel)*.04;
        const REPEL = IS_MOBILE ? 90 : 110;
        const FORCE = IS_MOBILE ? 0.55 : 0.75;
        const repX = IS_TOUCH ? sW/2 + gyroX*sW*.28 : mouseX;
        const repY = IS_TOUCH ? sH/2 + gyroY*sH*.28 : mouseY;

        spores.forEach(s => {
            s.phase += .007;
            const dx=s.x-repX, dy=s.y-repY;
            const d=Math.sqrt(dx*dx+dy*dy);
            if (d < REPEL && d > 0) {
                const f=(REPEL-d)/REPEL*FORCE;
                s.vx += (dx/d)*f*.14; s.vy += (dy/d)*f*.14;
            }
            s.vx *= .97; s.vy = s.vy*.97-(0.045+Math.random()*.018)*boost;
            s.x += s.vx+Math.sin(s.phase)*.09; s.y += s.vy;
            if (s.y<-4){s.y=sH+4;s.x=Math.random()*sW;s.vx=(Math.random()-.5)*.14;s.vy=-(Math.random()*.28+.06)}
            if (s.x<-4) s.x=sW+4; if (s.x>sW+4) s.x=-4;
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fillStyle=s.hue+(s.op*(.68+Math.sin(s.phase)*.28))+')';
            ctx.fill();
        });
        requestAnimationFrame(anim);
    }
    anim();
    window.addEventListener('resize',()=>{ sW=sc2.width=window.innerWidth; sH=sc2.height=window.innerHeight; },{passive:true});
})();

/* ═══════════════════════════════════════
   5. TV NOISE
═══════════════════════════════════════ */
(function initNoise() {
    const nc=document.getElementById('noise-canvas');
    const nctx=nc.getContext('2d');
    nc.width=200; nc.height=200;
    function draw() {
        const img=nctx.createImageData(200,200),d=img.data;
        for (let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;}
        nctx.putImageData(img,0,0); setTimeout(draw,90);
    }
    draw();
    document.querySelectorAll('.event-card').forEach(c=>{
        c.addEventListener(IS_TOUCH?'touchstart':'mouseenter',()=>{
            nc.style.opacity='.07'; setTimeout(()=>{nc.style.opacity='.028';},340);
        },{passive:true});
    });
})();

/* ═══════════════════════════════════════
   6. HAWKINS MAP — showDetail logic
   (pins use onclick="showDetail(key)")
═══════════════════════════════════════ */

/* ── EVENT DATA ─────────────────────────────────────
   loc  = update when rooms are confirmed
   link = paste your Google Form URL here
   ──────────────────────────────────────────────────── */
const details = {
  bgmi: {
    tag:   '// OP-01 · GAMING',
    title: 'BGMI CHAMPIONSHIP',
    loc:   'Location: TBD — Coming Soon',
    link:  'https://forms.gle/piwABwTdzCjpRWS16'
  },
  ff: {
    tag:   '// OP-02 · GAMING',
    title: 'FREE FIRE CHAMPIONSHIP',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
  ipl: {
    tag:   '// OP-03 · STRATEGY',
    title: 'IPL AUCTION',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
  reel: {
    tag:   '// OP-04 · CREATIVE',
    title: 'REEL MAKING COMPETITION',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
  proj: {
    tag:   '// OP-05 · TECHNICAL',
    title: 'PROJECT COMPETITION',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
  robo: {
    tag:   '// OP-06 · ROBOTICS',
    title: 'ROBO SOCCER',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
  quiz: {
    tag:   '// OP-07 · QUIZ',
    title: 'THEME BASED QUIZ',
    loc:   'Location: TBD — Coming Soon',
    link:  'YOUR_FORM_LINK_HERE'
  },
};

/* ── showDetail — called by onclick on each pin ── */
function showDetail(key) {
  const d = details[key];
  if (!d) return;

  document.getElementById('md-tag').textContent   = d.tag;
  document.getElementById('md-title').textContent = d.title;
  document.getElementById('md-loc').textContent   = d.loc;
  document.getElementById('md-coming').textContent =
    '\u{1F4CD} Venue details will be updated shortly. Stay tuned!';

  // Wire up the Register button with the correct form link
  const regBtn = document.getElementById('md-register');
  if (regBtn) {
    if (d.link && d.link !== 'YOUR_FORM_LINK_HERE') {
      regBtn.href = d.link;
      regBtn.style.display = 'inline-flex';
    } else {
      regBtn.style.display = 'none';
    }
  }

  const det = document.getElementById('mapDetail');
  det.classList.remove('active');
  void det.offsetWidth;   // force reflow so CSS animation replays
  det.classList.add('active');
}

/* ── Live coordinate tracker ── */
(function initMapCoords() {
  const mc = document.getElementById('mapContainer');
  if (!mc) return;
  mc.addEventListener('mousemove', e => {
    const r = mc.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(2);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(2);
    const el = document.getElementById('mapCoords');
    if (el) el.textContent = 'X: ' + x + ' · Y: ' + y;
  });
  mc.addEventListener('mouseleave', () => {
    const el = document.getElementById('mapCoords');
    if (el) el.textContent = 'LAT: 00.0000 · LNG: 00.0000';
  });
})();

/* ═══════════════════════════════════════
   7. 3D TILT + HOLO (desktop only)
═══════════════════════════════════════ */
if (!IS_TOUCH) {
    document.querySelectorAll('.event-card').forEach(card=>{
        const shine=card.querySelector('.holo-shine');
        card.addEventListener('mousemove',e=>{
            const r=card.getBoundingClientRect();
            const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
            const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
            card.style.transform=`perspective(750px) rotateX(${dy*11}deg) rotateY(${-dx*11}deg) translateY(-6px) scale(1.02)`;
            if(shine){
                const px=((e.clientX-r.left)/r.width)*100;
                const py=((e.clientY-r.top)/r.height)*100;
                shine.style.background=`radial-gradient(circle at ${px}% ${py}%,rgba(255,175,45,.09) 0%,rgba(45,195,255,.065) 30%,rgba(195,45,255,.05) 60%,transparent 80%)`;
                shine.style.opacity='1';
            }
        });
        card.addEventListener('mouseleave',()=>{
            card.style.transform='';
            if(shine){shine.style.background='';shine.style.opacity='0';}
        });
    });
}

/* ═══════════════════════════════════════
   8. AMBIENT SOUND
═══════════════════════════════════════ */
(function initSound() {
    const btn=document.getElementById('sound-btn');
    const onIco=document.getElementById('sound-on-icon');
    const offIco=document.getElementById('sound-off-icon');
    let actx=null, playing=false;

    function buildAudio(){
        actx=new (window.AudioContext||window.webkitAudioContext)();
        const master=actx.createGain();
        master.gain.setValueAtTime(.001,actx.currentTime);
        master.gain.linearRampToValueAtTime(.2,actx.currentTime+2);
        master.connect(actx.destination);
        [55,110,82.4].forEach(freq=>{
            const o=actx.createOscillator(),g=actx.createGain();
            o.type='sawtooth'; o.frequency.value=freq; g.gain.value=.07;
            o.connect(g); g.connect(master); o.start();
            const lfo=actx.createOscillator(),lg=actx.createGain();
            lfo.frequency.value=.3; lg.gain.value=.4;
            lfo.connect(lg); lg.connect(o.frequency); lfo.start();
        });
        const bufSz=actx.sampleRate*2,buf=actx.createBuffer(1,bufSz,actx.sampleRate);
        const dat=buf.getChannelData(0); for(let i=0;i<bufSz;i++) dat[i]=Math.random()*2-1;
        const w=actx.createBufferSource(); w.buffer=buf; w.loop=true;
        const wf=actx.createBiquadFilter(); wf.type='bandpass'; wf.frequency.value=380; wf.Q.value=.45;
        const wg=actx.createGain(); wg.gain.value=.055;
        w.connect(wf); wf.connect(wg); wg.connect(master); w.start();
        const h=actx.createOscillator(),hg=actx.createGain();
        h.type='square'; h.frequency.value=60; hg.gain.value=.012;
        h.connect(hg); hg.connect(master); h.start();
    }

    btn.addEventListener('click',()=>{
        if(!playing){
            if(!actx) buildAudio(); else actx.resume();
            playing=true; btn.classList.add('playing');
            onIco.style.display='none'; offIco.style.display='';
        } else {
            actx.suspend(); playing=false; btn.classList.remove('playing');
            onIco.style.display=''; offIco.style.display='none';
        }
    });

    document.querySelectorAll('.event-card').forEach(c=>{
        c.addEventListener(IS_TOUCH?'touchstart':'mouseenter',()=>{
            if(!playing||!actx) return;
            const o=actx.createOscillator(),g=actx.createGain();
            o.type='square'; o.frequency.setValueAtTime(700,actx.currentTime);
            o.frequency.exponentialRampToValueAtTime(180,actx.currentTime+.08);
            g.gain.setValueAtTime(.035,actx.currentTime);
            g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.08);
            o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime+.08);
        },{passive:true});
    });
})();

/* ═══════════════════════════════════════
   9. MOBILE MENU (Demogorgon mouth)
═══════════════════════════════════════ */
const menuBtn=document.getElementById('menu-btn');
const mobileNav=document.getElementById('mobile-nav');
const backdrop=document.getElementById('mob-backdrop');

function openMobileNav(){
    menuBtn.classList.add('open');
    mobileNav.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow='hidden';
}
function closeMobileNav(){
    menuBtn.classList.remove('open');
    mobileNav.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow='';
}
menuBtn.addEventListener('click',()=>{ mobileNav.classList.contains('open')?closeMobileNav():openMobileNav(); });

/* ═══════════════════════════════════════
   10. PORTAL RIPPLE on Register
═══════════════════════════════════════ */
document.querySelectorAll('.register-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
        // e.preventDefault() REMOVED — allows Google Form link to open
        const ripEl=document.getElementById('portal-ripple');
        // Get coords — touch or mouse
        let x,y;
        if(e.changedTouches&&e.changedTouches.length){
            x=e.changedTouches[0].clientX; y=e.changedTouches[0].clientY;
        } else { x=e.clientX; y=e.clientY; }
        ripEl.innerHTML='';
        const bg=document.createElement('div'); bg.className='ripple-bg';
        const grad=`radial-gradient(circle at ${x}px ${y}px,rgba(80,0,10,.32) 0%,transparent 50%)`;
        bg.style.background=grad; ripEl.appendChild(bg);
        const colors=['rgba(200,30,0,.8)','rgba(160,0,220,.55)','rgba(200,100,0,.45)','rgba(100,0,200,.35)'];
        colors.forEach((c,i)=>{
            const r=document.createElement('div'); r.className='ripple-ring';
            r.style.cssText=`left:${x}px;top:${y}px;width:50px;height:50px;border-color:${c};animation-delay:${i*.11}s;animation-duration:${.85+i*.14}s`;
            ripEl.appendChild(r);
        });
        ripEl.classList.add('active');
        setTimeout(()=>{ ripEl.classList.remove('active'); ripEl.innerHTML=''; },1600);
    });
});

/* ═══════════════════════════════════════
   DESKTOP CURSOR
═══════════════════════════════════════ */
if (!IS_TOUCH) {
    const dot=document.getElementById('cursor-dot');
    const trail=document.getElementById('cursor-trail');
    let mx=0,my=0,tx=0,ty=0;
    document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; },{passive:true});
    (function ac(){ tx+=(mx-tx)*.13; ty+=(my-ty)*.13; trail.style.left=tx+'px'; trail.style.top=ty+'px'; requestAnimationFrame(ac); })();
}

/* ═══════════════════════════════════════
   SCROLL HANDLER
═══════════════════════════════════════ */
const mainNav=document.getElementById('main-nav');
const layerSky=document.getElementById('layer-sky');
const layerStars=document.getElementById('layer-stars');
const layerMist=document.getElementById('layer-mist');
const heroContent=document.getElementById('hero-content');
const vines=document.querySelectorAll('.vine');
let ticking=false;

window.addEventListener('scroll',()=>{
    scrollY=window.scrollY;
    scrollVel=scrollY-lastSY; lastSY=scrollY;
    if(!ticking){ requestAnimationFrame(()=>{ handleScroll(scrollY); ticking=false; }); ticking=true; }
},{passive:true});

function handleScroll(sy){
    mainNav.classList.toggle('scrolled',sy>55);
    // Parallax only on desktop (saves mobile battery)
    if(!IS_MOBILE){
        if(layerSky)   layerSky.style.transform   =`translateY(${sy*.24}px)`;
        if(layerStars) layerStars.style.transform  =`translateY(${sy*.18}px)`;
        if(layerMist)  layerMist.style.transform   =`translateY(${sy*.42}px)`;
        if(heroContent) heroContent.style.transform=`translateY(${sy*.15}px)`;
    }
    const pct=sy/Math.max(1,document.body.scrollHeight-window.innerHeight);
    vines.forEach((v,i)=>{ v.classList.toggle('grow',pct>0.05+i*.05); });
}

/* ═══════════════════════════════════════
   FLICKER LETTER REVEAL
═══════════════════════════════════════ */
const flickObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting&&!e.target.dataset.done){ flickIn(e.target); e.target.dataset.done='1'; }});
},{threshold:.4});
document.querySelectorAll('[data-flicker]').forEach(el=>flickObs.observe(el));

function flickIn(el){
    if(REDUCED){ return; }
    const text=el.textContent; el.innerHTML='';
    [...text].forEach((ch,i)=>{
        const s=document.createElement('span');
        s.textContent=ch===' '?'\u00A0':ch;
        s.style.cssText='display:inline-block;opacity:0;transition:text-shadow .35s';
        el.appendChild(s);
        const d=Math.random()*600+i*30;
        setTimeout(()=>{
            s.style.opacity='.8'; s.style.textShadow='0 0 20px #ff3300';
            setTimeout(()=>{s.style.opacity='.1';s.style.textShadow='none'},65);
            setTimeout(()=>{s.style.opacity='.92';s.style.textShadow='0 0 14px #ff3300'},130);
            setTimeout(()=>{s.style.opacity='.28'},195);
            setTimeout(()=>{s.style.opacity='1';s.style.textShadow='0 0 7px rgba(200,25,0,.25)'},280);
        },d);
    });
}

/* ═══════════════════════════════════════════════════════════
   IDEA B — "YOU HAVE BEEN CHOSEN" CINEMATIC ENTRANCE
   Runs FIRST before the glitch intro
═══════════════════════════════════════════════════════════ */
(function chosenEntrance() {
    const screen = document.getElementById('chosen-screen');
    const cc     = document.getElementById('chosen-canvas');
    const cl1    = document.getElementById('cl1');
    const cl2    = document.getElementById('cl2');
    const cl3    = document.getElementById('cl3');
    if (!screen || !cc) return;

    // Resize canvas
    cc.width  = window.innerWidth;
    cc.height = window.innerHeight;
    const ctx = cc.getContext('2d');

    // Animated scanlines + flicker on canvas
    let frame = 0;
    function drawBG() {
        if (!screen.parentNode) return;
        frame++;
        ctx.fillStyle = `rgba(0,0,0,${0.85 + Math.random()*.1})`;
        ctx.fillRect(0, 0, cc.width, cc.height);
        // horizontal glitch bars
        for (let i = 0; i < 4; i++) {
            if (Math.random() > 0.7) {
                ctx.fillStyle = `rgba(${150+Math.random()*60},0,0,${Math.random()*.12})`;
                ctx.fillRect(0, Math.random()*cc.height, cc.width, Math.random()*3+1);
            }
        }
        // scan lines
        for (let y = 0; y < cc.height; y += 3) {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(0, y, cc.width, 1);
        }
        requestAnimationFrame(drawBG);
    }
    drawBG();

    // Typewriter helper
    function typeText(el, text, speed, cb) {
        let i = 0;
        el.textContent = '';
        const t = setInterval(() => {
            el.textContent += text[i++];
            if (i >= text.length) { clearInterval(t); if (cb) cb(); }
        }, speed);
    }

    // Sequence
    // 0.0s — black silence
    // 0.6s — line 1 types
    // 1.8s — line 2 types
    // 3.0s — PRAGYOTSAV 2K26 slams in
    // 4.5s — fade out → glitch intro starts

    setTimeout(() => {
        typeText(cl1, 'YOU HAVE BEEN CHOSEN.', 55, () => {
            setTimeout(() => {
                typeText(cl2, 'PRAGYOTSAV 2K26 AWAITS.', 45, () => {
                    setTimeout(() => {
                        // Big title slam
                        cl3.textContent = 'PRAGYOTSAV 2K26';
                        // Screen shake
                        screen.style.animation = 'chosenShake 0.35s ease';
                        setTimeout(() => {
                            // Fade out, then remove
                            screen.classList.add('fade-out');
                            setTimeout(() => {
                                screen.style.display = 'none';
                            }, 850);
                        }, 1200);
                    }, 300);
                });
            }, 600);
        });
    }, 500);
})();

/* ═══════════════════════════════════════════════════════════
   IDEA F — STRANGER THINGS CHARACTER QUIZ
   Multi-question · Canvas card · Download · Share · WhatsApp
═══════════════════════════════════════════════════════════ */
(function initCharQuiz() {
    const overlay  = document.getElementById('char-quiz-overlay');
    const closeBtn = document.getElementById('char-quiz-close');
    const trigBtn  = document.getElementById('char-quiz-btn');
    const qScreen  = document.getElementById('cq-question-screen');
    const rScreen  = document.getElementById('cq-result-screen');
    const retryBtn = document.getElementById('cq-retry');
    if (!overlay) return;

    /* ── QUESTIONS ── */
    const QUESTIONS = [
        {
            q: 'Your friend is in danger. You...',
            opts: [
                { text: 'Use your mind to find a solution', pts: { eleven:3, dustin:2 } },
                { text: 'Rush in without hesitation',       pts: { hopper:3, max:1 } },
                { text: 'Build a plan and rally the group', pts: { dustin:3, will:1 } },
                { text: 'Disappear and handle it solo',     pts: { eleven:2, max:2 } }
            ]
        },
        {
            q: 'Your perfect Saturday is...',
            opts: [
                { text: 'Solving a mystery or puzzle',           pts: { dustin:3, will:2 } },
                { text: 'Skating or doing something physical',   pts: { max:3, hopper:1 } },
                { text: 'Sitting quietly, lost in your thoughts',pts: { eleven:3, will:2 } },
                { text: 'Protecting the people you love',        pts: { hopper:3, joyce:1 } }
            ]
        },
        {
            q: 'People would describe you as...',
            opts: [
                { text: 'Mysterious and powerful',     pts: { eleven:3, will:1 } },
                { text: 'Loyal and unstoppable',       pts: { hopper:3, joyce:2 } },
                { text: 'Clever and resourceful',      pts: { dustin:3, max:1 } },
                { text: 'Bold and unpredictable',      pts: { max:3, eleven:1 } }
            ]
        },
        {
            q: 'Your biggest strength is...',
            opts: [
                { text: 'Raw, extraordinary power',    pts: { eleven:4 } },
                { text: 'Never giving up on family',   pts: { hopper:3, joyce:3 } },
                { text: 'Knowing everything about everything', pts: { dustin:4 } },
                { text: 'Pure fearless energy',        pts: { max:4 } }
            ]
        },
        {
            q: 'In the Upside Down you would be...',
            opts: [
                { text: 'The one with the power',       pts: { eleven:4 } },
                { text: 'The one leading the charge',   pts: { hopper:3, max:1 } },
                { text: 'The one with the gadgets',     pts: { dustin:4 } },
                { text: 'The one nobody expected',      pts: { will:3, max:2 } }
            ]
        }
    ];

    /* ── CHARACTERS ── */
    const CHARS = {
        eleven: {
            tag:    '// CLASSIFIED · SUBJECT 011',
            name:   'ELEVEN',
            icon:   '🌀',
            color:  '#cc2200',
            accent: 'rgba(200,30,0,',
            traits: ['Psychic','Powerful','Mysterious'],
            traitColors: ['#cc2200','#884400','#550066'],
            desc:   'You see what others cannot. Your mind is your greatest weapon and your biggest mystery. Quiet, intense, and devastatingly powerful — you carry the weight of the world without asking for help.',
            power:  'Telekinesis & Mind-Link'
        },
        hopper: {
            tag:    '// CLASSIFIED · CHIEF HOPPER',
            name:   'HOPPER',
            icon:   '🛡️',
            color:  '#cc6600',
            accent: 'rgba(200,100,0,',
            traits: ['Guardian','Fearless','Loyal'],
            traitColors: ['#cc6600','#884400','#aa4400'],
            desc:   'Gruff on the outside, fiercely loyal within. You charge in first and ask questions later. When the people you love are in danger, nothing in this world or the Upside Down can stop you.',
            power:  'Unbreakable Willpower'
        },
        dustin: {
            tag:    '// CLASSIFIED · DUSTIN HENDERSON',
            name:   'DUSTIN',
            icon:   '⚡',
            color:  '#ccaa00',
            accent: 'rgba(200,170,0,',
            traits: ['Strategist','Curious','Inventive'],
            traitColors: ['#ccaa00','#886600','#aa8800'],
            desc:   'Your brain works faster than everyone else. You find solutions nobody else sees, build gadgets nobody else thinks of, and somehow make everyone laugh while saving the day. The MVP every time.',
            power:  'Supreme Intelligence'
        },
        max: {
            tag:    '// CLASSIFIED · MAX MAYFIELD',
            name:   'MAX',
            icon:   '🔥',
            color:  '#dd0066',
            accent: 'rgba(220,0,100,',
            traits: ['Bold','Fast','Unpredictable'],
            traitColors: ['#dd0066','#880044','#cc0055'],
            desc:   'Fast, fearless, and impossible to predict. You act on pure instinct and somehow always land exactly where you need to be. Independent, fierce, and completely your own person — nobody defines you.',
            power:  'Pure Fearless Energy'
        },
        will: {
            tag:    '// CLASSIFIED · WILL BYERS',
            name:   'WILL',
            icon:   '🌒',
            color:  '#4466cc',
            accent: 'rgba(60,100,200,',
            traits: ['Resilient','Sensitive','Brave'],
            traitColors: ['#4466cc','#224488','#3355aa'],
            desc:   'You have been through more than anyone should endure, yet you keep going. Quiet strength runs through you. You feel everything deeply, see what others miss, and your courage shows not in loudness but in endurance.',
            power:  'Inner Resilience'
        },
        joyce: {
            tag:    '// CLASSIFIED · JOYCE BYERS',
            name:   'JOYCE',
            icon:   '💡',
            color:  '#cc44aa',
            accent: 'rgba(200,60,170,',
            traits: ['Fierce','Devoted','Determined'],
            traitColors: ['#cc44aa','#882266','#aa3388'],
            desc:   'When everyone says give up, you double down. Your love for the people around you is so fierce it transcends logic. You will tear through walls, dimensions, and anything else standing between you and your people.',
            power:  'Unconditional Love'
        }
    };

    /* ── STATE ── */
    let scores = {};
    let currentQ = 0;

    function resetScores() {
        scores = {};
        Object.keys(CHARS).forEach(k => { scores[k] = 0; });
    }

    function getWinner() {
        return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
    }

    /* ── RENDER QUESTION ── */
    function renderQuestion(idx) {
        const q   = QUESTIONS[idx];
        const pct = ((idx) / QUESTIONS.length * 100).toFixed(0);
        document.getElementById('cq-progress').style.width = pct + '%';
        document.getElementById('cq-q-tag').textContent =
            '// Q' + (idx+1) + ' of ' + QUESTIONS.length + ' — HAWKINS IDENTIFICATION';
        document.getElementById('cq-q-text').textContent = q.q;
        const optsEl = document.getElementById('cq-opts');
        optsEl.innerHTML = '';
        q.opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'cq-opt';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => pickAnswer(opt.pts));
            optsEl.appendChild(btn);
        });
    }

    function pickAnswer(pts) {
        Object.entries(pts).forEach(([k, v]) => { scores[k] = (scores[k]||0) + v; });
        currentQ++;
        if (currentQ < QUESTIONS.length) {
            renderQuestion(currentQ);
        } else {
            showResult();
        }
    }

    /* ── SHOW RESULT CARD ── */
    function showResult() {
        document.getElementById('cq-progress').style.width = '100%';
        const key  = getWinner();
        const char = CHARS[key];

        showScreen('result');

        // Player name on card
        const playerName = (document.getElementById('cq-name-input')?.value || '').trim();
        const playerEl = document.getElementById('cqc-player-name');
        if (playerEl) playerEl.textContent = playerName ? playerName.toUpperCase() + ' IS' : '';

        // Fill card
        document.getElementById('cqc-tag').textContent  = char.tag;
        document.getElementById('cqc-name').textContent = char.name;
        document.getElementById('cqc-icon').textContent = char.icon;
        document.getElementById('cqc-desc').textContent = char.desc;

        // Style card accent colour
        const card = document.getElementById('cq-card');
        card.style.borderColor  = char.color + 'aa';
        card.style.boxShadow    = '0 0 40px ' + char.accent + '.15)';

        // Traits
        const traitsEl = document.getElementById('cqc-traits');
        traitsEl.innerHTML = '';
        char.traits.forEach((t, i) => {
            const span = document.createElement('span');
            span.className = 'cqc-trait';
            span.textContent = t;
            span.style.color        = char.traitColors[i];
            span.style.borderColor  = char.traitColors[i] + '55';
            span.style.background   = char.traitColors[i] + '11';
            traitsEl.appendChild(span);
        });

        // Power line — add if not present
        let powerEl = document.getElementById('cqc-power');
        if (!powerEl) {
            powerEl = document.createElement('div');
            powerEl.id = 'cqc-power';
                        powerEl.style.fontFamily = "'Share Tech Mono', monospace";
            powerEl.style.fontSize = '.6rem';
            powerEl.style.letterSpacing = '.18em';
            powerEl.style.textTransform = 'uppercase';
            powerEl.style.marginBottom = '10px';
            powerEl.style.padding = '5px 10px';
            powerEl.style.borderLeft = '2px solid';
            powerEl.style.display = 'inline-block';
            traitsEl.after(powerEl);
        }
        powerEl.textContent = '⚡ ' + char.power;
        powerEl.style.color        = char.color;
        powerEl.style.borderColor  = char.color;
        powerEl.style.background   = char.accent + '.06)';

        // Name glow colour
        const nameEl = document.getElementById('cqc-name');
        nameEl.style.color = '#fff';
        nameEl.style.textShadow = '0 0 30px ' + char.color + ', 0 0 60px ' + char.accent + '.3)';

        // Flash effect
        overlay.style.background = char.accent + '.12)';
        setTimeout(() => { overlay.style.background = 'rgba(0,0,0,.85)'; }, 250);
    }

    /* ── CANVAS CARD RENDERER ──
       Draws the card precisely to match the on-screen design.
       Uses fonts that canvas can reliably render.
    ── */
    function renderCardToCanvas() {
        return new Promise(resolve => {
            const key  = getWinner();
            const char = CHARS[key];
            const playerName = (document.getElementById('cq-name-input')?.value || '').trim();

            // High-res: 2x scale for sharp downloads on retina/mobile
            const SCALE = 2;
            const W = 600, H = 400;
            const canvas = document.getElementById('cq-render-canvas');
            canvas.width  = W * SCALE;
            canvas.height = H * SCALE;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            const ctx = canvas.getContext('2d');
            ctx.scale(SCALE, SCALE);

            // ── BACKGROUND ──
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

            // Corner glow
            const grd = ctx.createRadialGradient(0, H, 5, 0, H, 260);
            grd.addColorStop(0, char.color + '30'); grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

            // Top-right accent glow
            const grd2 = ctx.createRadialGradient(W, 0, 5, W, 0, 200);
            grd2.addColorStop(0, char.color + '18'); grd2.addColorStop(1, 'transparent');
            ctx.fillStyle = grd2; ctx.fillRect(0, 0, W, H);

            // Scanlines — subtle
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

            // ── BORDER ──
            ctx.strokeStyle = char.color + 'cc'; ctx.lineWidth = 1.5;
            ctx.strokeRect(2, 2, W-4, H-4);

            // Corner brackets
            const B = 20, BT = 2.5;
            ctx.strokeStyle = char.color; ctx.lineWidth = BT;
            // TL
            ctx.beginPath(); ctx.moveTo(10+B,10); ctx.lineTo(10,10); ctx.lineTo(10,10+B); ctx.stroke();
            // TR
            ctx.beginPath(); ctx.moveTo(W-10-B,10); ctx.lineTo(W-10,10); ctx.lineTo(W-10,10+B); ctx.stroke();
            // BL
            ctx.beginPath(); ctx.moveTo(10+B,H-10); ctx.lineTo(10,H-10); ctx.lineTo(10,H-10-B); ctx.stroke();
            // BR
            ctx.beginPath(); ctx.moveTo(W-10-B,H-10); ctx.lineTo(W-10,H-10); ctx.lineTo(W-10,H-10-B); ctx.stroke();

            // ── CLASSIFIED watermark ──
            ctx.save();
            ctx.globalAlpha = 0.07;
            ctx.font = 'bold 52px monospace'; ctx.fillStyle = char.color;
            ctx.textAlign = 'right';
            ctx.fillText('CLASSIFIED', W-16, H-16);
            ctx.restore();

            // ── TAG LINE ──
            ctx.font = '500 11px monospace';
            ctx.fillStyle = char.color + 'bb'; ctx.textAlign = 'left';
            ctx.fillText(char.tag, 20, 34);

            // ── PLAYER NAME (if entered) ──
            let topY = 56;
            if (playerName) {
                ctx.font = '500 13px monospace';
                ctx.fillStyle = 'rgba(200,160,220,0.55)';
                ctx.fillText(playerName.toUpperCase() + ' IS', 20, topY);
                topY += 4;
            }

            // ── ICON ──
            ctx.font = '64px serif';
            ctx.fillText(char.icon, 18, topY + 66);

            // ── CHARACTER NAME ── big, with shadow glow
            ctx.shadowColor = char.color;
            ctx.shadowBlur = 16;
            ctx.font = 'bold 72px Georgia, serif'; // Georgia renders reliably in canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillText(char.name, 110, topY + 72);
            ctx.shadowBlur = 0;

            // ── POWER TAG ──
            const powerY = topY + 92;
            ctx.font = '500 12px monospace'; ctx.fillStyle = char.color;
            // Pill background
            const powerText = '⚡ ' + char.power;
            const pw = ctx.measureText(powerText).width + 20;
            ctx.fillStyle = char.color + '18';
            roundRect(ctx, 108, powerY - 14, pw, 20, 3);
            ctx.fill();
            ctx.strokeStyle = char.color + '55'; ctx.lineWidth = 1;
            roundRect(ctx, 108, powerY - 14, pw, 20, 3);
            ctx.stroke();
            ctx.fillStyle = char.color;
            ctx.font = '500 11px monospace';
            ctx.fillText(powerText, 118, powerY);

            // ── TRAITS ──
            const traitY = powerY + 26;
            let tx = 110;
            char.traits.forEach((t, i) => {
                ctx.font = '500 10px monospace';
                const tw = ctx.measureText(t).width + 16;
                // Pill
                ctx.fillStyle = char.traitColors[i] + '20';
                roundRect(ctx, tx, traitY - 13, tw, 18, 3);
                ctx.fill();
                ctx.strokeStyle = char.traitColors[i] + '66'; ctx.lineWidth = 1;
                roundRect(ctx, tx, traitY - 13, tw, 18, 3);
                ctx.stroke();
                // Text
                ctx.fillStyle = char.traitColors[i];
                ctx.fillText(t.toUpperCase(), tx + 8, traitY);
                tx += tw + 8;
            });

            // ── DESCRIPTION (word-wrap) ──
            const descY = traitY + 28;
            ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(200,170,220,0.72)';
            const words = char.desc.split(' ');
            let line = '', lY = descY;
            const maxW = W - 40;
            words.forEach(w => {
                const test = line + w + ' ';
                if (ctx.measureText(test).width > maxW && line) {
                    ctx.fillText(line.trim(), 20, lY);
                    line = w + ' '; lY += 22;
                } else { line = test; }
            });
            if (line.trim()) ctx.fillText(line.trim(), 20, lY);

            // ── DIVIDER ──
            ctx.strokeStyle = char.color + '33'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(20, H-52); ctx.lineTo(W-20, H-52); ctx.stroke();
            ctx.setLineDash([]);

            // ── FOOTER BRANDING ──
            ctx.font = '500 10px monospace'; ctx.fillStyle = char.color + '99';
            ctx.textAlign = 'left';
            ctx.fillText('PRAGYOTSAV 2K26  ·  TECHKRUNCH  ·  GHRCEM ENTC', 20, H-30);

            ctx.fillStyle = 'rgba(180,140,200,0.4)'; ctx.textAlign = 'right';
            ctx.fillText('Visit: pragyotsav2k26.com', W-20, H-30);

            ctx.font = '9px monospace'; ctx.fillStyle = 'rgba(200,30,0,0.28)';
            ctx.textAlign = 'center';
            ctx.fillText('"Enter the Upside Down of Technology"', W/2, H-13);

            resolve(canvas);
        });
    }

    // Helper: rounded rectangle path
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
        ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
        ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
        ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
        ctx.closePath();
    }

    /* ── TOAST HELPER ── */
    function showToast(msg) {
        let t = document.querySelector('.cq-toast');
        if (!t) { t = document.createElement('div'); t.className = 'cq-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }

    /* ── DOWNLOAD CARD ── */
    document.getElementById('cq-download-btn')?.addEventListener('click', async () => {
        const canvas = await renderCardToCanvas();
        const key = getWinner();
        const playerName = (document.getElementById('cq-name-input')?.value || '').trim();
        const namePart = playerName ? playerName.replace(/\s+/g,'-') + '-is-' : 'I-am-';
        const link = document.createElement('a');
        link.download = namePart + CHARS[key].name + '-PRAGYOTSAV2K26.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Card saved! Share it with your squad 🔴');
    });

    /* ── WEB SHARE / COPY LINK ── */
    document.getElementById('cq-share-btn')?.addEventListener('click', async () => {
        const key  = getWinner();
        const char = CHARS[key];
        const pN = (document.getElementById('cq-name-input')?.value || '').trim();
        const text = pN
            ? pN + ' is ' + char.name + ' on the Stranger Things Character Quiz at PRAGYOTSAV 2K26! Which character are YOU? Try it at pragyotsav2k26.com 🔴'
            : 'I got ' + char.name + ' on the Stranger Things Character Quiz at PRAGYOTSAV 2K26! Which character are YOU? Try it at pragyotsav2k26.com 🔴';
        if (navigator.share) {
            try {
                const canvas = await renderCardToCanvas();
                const blob   = await new Promise(r => canvas.toBlob(r, 'image/png'));
                const file   = new File([blob], 'I-am-' + char.name + '.png', { type: 'image/png' });
                await navigator.share({ title: 'I am ' + char.name + ' · PRAGYOTSAV 2K26', text, files: [file] });
            } catch {
                // Fallback — share without image
                try { await navigator.share({ title: 'I am ' + char.name + ' · PRAGYOTSAV 2K26', text }); }
                catch { copyToClipboard(text); }
            }
        } else {
            copyToClipboard(text);
        }
    });

    function copyToClipboard(text) {
        navigator.clipboard?.writeText(text).then(() => {
            showToast('Link copied! Paste it anywhere 📋');
        }).catch(() => { showToast('Share: pragyotsav2k26.com'); });
    }

    /* ── WHATSAPP SHARE ── */
    document.getElementById('cq-wa-btn')?.addEventListener('click', () => {
        const key  = getWinner();
        const char = CHARS[key];
        const pName = (document.getElementById('cq-name-input')?.value || '').trim();
        const intro = pName
            ? '🔴 ' + pName + ' just took the Stranger Things Character Quiz at PRAGYOTSAV 2K26!\n\n' + pName + ' is: *' + char.name + '*'
            : '🔴 I just took the Stranger Things Character Quiz at PRAGYOTSAV 2K26!\n\nI got: *' + char.name + '*';
        const msg  = encodeURIComponent(
            intro + '\n' +
            char.desc + '\n\n' +
            'Which character are YOU? Find out 👇\n' +
            'pragyotsav2k26.com\n\n' +
            '#PRAGYOTSAV2K26 #TechKrunch #StrangerThings #GHRCEM'
        );
        window.open('https://wa.me/?text=' + msg, '_blank');
        showToast('Opening WhatsApp... 💬');
    });

    /* ── SCREEN MANAGER — single source of truth ── */
    const SCREENS = {
        name:     document.getElementById('cq-name-screen'),
        question: document.getElementById('cq-question-screen'),
        result:   document.getElementById('cq-result-screen')
    };

    function showScreen(which) {
        Object.entries(SCREENS).forEach(([key, el]) => {
            if (!el) return;
            if (key === which) {
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
            } else {
                el.style.display = 'none';
            }
        });
    }

    /* ── OPEN / CLOSE ── */
    function openQuiz() {
        resetScores(); currentQ = 0;
        overlay.classList.remove('hidden');
        showScreen('name');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const inp = document.getElementById('cq-name-input');
            if (inp) inp.focus();
        }, 350);
    }

    function closeQuiz() {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (trigBtn)  trigBtn.addEventListener('click', openQuiz);
    if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeQuiz(); });

    // Retry → back to name screen
    if (retryBtn) retryBtn.addEventListener('click', () => {
        resetScores(); currentQ = 0;
        const inp = document.getElementById('cq-name-input');
        if (inp) inp.value = '';
        showScreen('name');
        setTimeout(() => { const i = document.getElementById('cq-name-input'); if(i) i.focus(); }, 200);
    });

    // Start button
    const startBtn  = document.getElementById('cq-start-btn');
    const nameInput = document.getElementById('cq-name-input');

    function beginQuiz() {
        showScreen('question');
        renderQuestion(0);
    }

    if (startBtn)  startBtn.addEventListener('click', beginQuiz);
    if (nameInput) nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') beginQuiz(); });
})();

/* ═══════════════════════════════════════════════════════════
   IDEA G — WILL'S ALPHABET WALL (tap logo 5×)
═══════════════════════════════════════════════════════════ */
(function initAlphabetWall() {
    const wall    = document.getElementById('alphabet-wall');
    const lightsEl= document.getElementById('aw-lights-row');
    const msgEl   = document.getElementById('aw-message');
    if (!wall || !lightsEl || !msgEl) return;

    const SECRET_MSG = 'HELP ME · MARCH 24 · PRAGYOTSAV';
    const COLORS = ['on-r','on-y','on-g','on-b','on-p'];

    // Build bulb row — one per letter (including spaces shown as gaps)
    const letters = SECRET_MSG.split('');
    const bulbs   = [];
    lightsEl.innerHTML = '';
    letters.forEach((ch) => {
        const b = document.createElement('div');
        b.className = 'aw-bulb';
        b.dataset.char = ch;
        lightsEl.appendChild(b);
        bulbs.push(b);
    });

    function showWall() {
        wall.classList.remove('hidden');
        msgEl.textContent = '';
        // Reset all bulbs
        bulbs.forEach(b => { b.className = 'aw-bulb'; });
        document.body.style.overflow = 'hidden';

        // Spell out message letter by letter with lights
        let i = 0;
        function lightNext() {
            if (i >= bulbs.length) return;
            const b   = bulbs[i];
            const ch  = b.dataset.char;
            const col = COLORS[Math.floor(Math.random() * COLORS.length)];

            // Flash random bulbs for chaos
            if (Math.random() > 0.4) {
                const rand = bulbs[Math.floor(Math.random()*bulbs.length)];
                const rc   = COLORS[Math.floor(Math.random()*COLORS.length)];
                rand.className = 'aw-bulb ' + rc;
                setTimeout(() => { if (!rand.dataset.done) rand.className = 'aw-bulb'; }, 120);
            }

            b.className = 'aw-bulb ' + col;
            b.dataset.done = '1';

            // Update text message
            msgEl.textContent = SECRET_MSG.slice(0, i + 1);

            i++;
            const delay = ch === ' ' ? 80 : ch === '·' ? 200 : 130 + Math.random() * 80;
            setTimeout(lightNext, delay);
        }
        setTimeout(lightNext, 400);
    }

    function hideWall() {
        wall.classList.add('hidden');
        document.body.style.overflow = '';
    }

    wall.addEventListener('click', hideWall);
    wall.addEventListener('touchend', hideWall, { passive: true });

    // Tap logo 5× within 3 seconds to trigger
    const logo = document.querySelector('.hero-logo');
    if (!logo) return;
    let tapCount = 0, tapTimer = null;

    ['click', 'touchend'].forEach(ev => {
        logo.addEventListener(ev, e => {
            e.stopPropagation();
            tapCount++;
            clearTimeout(tapTimer);
            if (tapCount >= 5) {
                tapCount = 0;
                showWall();
            } else {
                tapTimer = setTimeout(() => { tapCount = 0; }, 3000);
            }
        }, { passive: ev === 'touchend' });
    });
})();

/* ═══════════════════════════════════════════════════════════
   IDEA L — "YOU SURVIVED" BADGE (scroll to bottom)
═══════════════════════════════════════════════════════════ */
(function initSurvivedBadge() {
    const badge = document.getElementById('survived-badge');
    if (!badge) return;

    // Add close button dynamically
    const inner = badge.querySelector('.sb-inner');
    if (inner) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'sb-close';
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.addEventListener('click', e => {
            e.stopPropagation();
            badge.classList.remove('show');
            sessionStorage.setItem('survivedDismissed', '1');
        });
        inner.appendChild(closeBtn);
    }

    let shown = false;
    const dismissed = sessionStorage.getItem('survivedDismissed');
    if (dismissed) return;

    function checkBottom() {
        const scrolled   = window.scrollY + window.innerHeight;
        const total      = document.body.scrollHeight;
        const nearBottom = scrolled >= total - 80;

        if (nearBottom && !shown) {
            shown = true;
            badge.classList.remove('hidden');
            // Small delay so it feels earned
            setTimeout(() => badge.classList.add('show'), 100);
        } else if (!nearBottom && shown) {
            badge.classList.remove('show');
        }
    }

    window.addEventListener('scroll', checkBottom, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   QUIZ BUTTON ATTENTION TOOLTIP
   — Shows while visitor is on hero section
   — Auto-hides when they scroll past hero
   — Dismiss button hides it for the session
   — Button wiggle + glow continues until clicked
═══════════════════════════════════════════════════════════ */
(function initQuizTooltip() {
    const tooltip  = document.getElementById('quiz-tooltip');
    const dismissBtn = document.getElementById('qt-dismiss');
    const quizBtn  = document.getElementById('char-quiz-btn');
    const heroSec  = document.getElementById('home');
    if (!tooltip || !heroSec) return;

    // Don't show if user already dismissed this session
    const dismissed = sessionStorage.getItem('quizTooltipDismissed');
    if (dismissed) { tooltip.classList.add('hidden'); return; }

    function hide(permanent) {
        tooltip.classList.add('dismissed');
        setTimeout(() => tooltip.classList.add('hidden'), 320);
        if (permanent) sessionStorage.setItem('quizTooltipDismissed', '1');
    }

    // Dismiss button — permanent for session
    if (dismissBtn) {
        dismissBtn.addEventListener('click', e => {
            e.stopPropagation();
            hide(true);
        });
    }

    // Clicking the quiz button also hides tooltip
    if (quizBtn) {
        quizBtn.addEventListener('click', () => hide(true), { once: true });
    }

    // Hide when user scrolls past the hero section
    const heroObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // User scrolled away from hero — hide tooltip
                if (!tooltip.classList.contains('hidden')) hide(false);
            } else {
                // User scrolled back to hero — show tooltip again (unless dismissed)
                if (!sessionStorage.getItem('quizTooltipDismissed')) {
                    tooltip.classList.remove('hidden', 'dismissed');
                }
            }
        });
    }, { threshold: 0.2 });

    heroObserver.observe(heroSec);

    // Extra attention: after 4 seconds on page, make tooltip do a bounce
    setTimeout(() => {
        if (!tooltip.classList.contains('hidden') &&
            !sessionStorage.getItem('quizTooltipDismissed')) {
            tooltip.style.animation = 'none';
            // Force reflow
            void tooltip.offsetWidth;
            tooltip.style.animation = 'tooltipBounce .6s cubic-bezier(.34,1.56,.64,1), tooltipGlow 2.5s ease-in-out infinite';
        }
    }, 4000);
})();
