/* ===========================
   SPLASH
=========================== */
const splash = document.getElementById("splash");
setTimeout(() => {
    if (!splash) return;
    splash.classList.add("hide");
    splash.addEventListener("transitionend", () => splash.classList.add("done"), { once:true });
}, 1900);

/* ===========================
   NAVBAR — scroll shadow
=========================== */
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
}, { passive:true });

/* ===========================
   NAVBAR — hamburguesa mobile
=========================== */
(function () {
    const btn  = document.getElementById("navHamburger");
    const menu = document.getElementById("navMobileMenu");
    if (!btn || !menu) return;

    function close() {
        menu.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
    }

    btn.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("open");
        btn.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", isOpen);
        menu.setAttribute("aria-hidden", !isOpen);
    });

    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("click", e => { if (!header.contains(e.target)) close(); });
})();

/* ===========================
   SCROLL REVEAL
=========================== */
const reveals = document.querySelectorAll(
    ".about, .services, .before-after-section, .process, .cta"
);
const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.88;
    reveals.forEach(el => {
        if (el.getBoundingClientRect().top < trigger) el.classList.add("active");
    });
};
window.addEventListener("scroll", revealOnScroll, { passive:true });
revealOnScroll();

/* ===========================
   BEFORE / AFTER SLIDER
=========================== */
(function () {
    const ba = document.querySelector(".before-after");
    if (!ba) return;

    const beforeWrapper = ba.querySelector(".before-wrapper");
    const sliderLine    = ba.querySelector(".slider-line");
    const sliderHandle  = ba.querySelector(".slider-handle");
    let dragging = false;

    function setPos(x) {
        const rect = ba.getBoundingClientRect();
        const pct  = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
        beforeWrapper.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        sliderLine.style.left   = `${pct}%`;
        sliderHandle.style.left = `${pct}%`;
    }

    function center() {
        const r = ba.getBoundingClientRect();
        setPos(r.left + r.width / 2);
    }

    ba.addEventListener("mousedown",  e => { dragging = true; setPos(e.clientX); });
    window.addEventListener("mousemove", e => { if (dragging) setPos(e.clientX); }, { passive:true });
    window.addEventListener("mouseup", () => { dragging = false; });
    ba.addEventListener("touchstart", e => { dragging = true; setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchmove", e => { if (dragging) setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchend", () => { dragging = false; });
    window.addEventListener("resize", center, { passive:true });
    center();
})();

/* ===========================
   CARRUSEL SERVICIOS
   loop infinito + escala central
=========================== */
(function () {
    const wrapper = document.querySelector(".services-track-wrapper");
    const track   = document.getElementById("servicesTrack");
    const btnPrev = document.getElementById("srvPrev");
    const btnNext = document.getElementById("srvNext");
    if (!track || !btnPrev || !btnNext) return;

    const origCards = Array.from(track.children);
    const N = origCards.length;

    // Triplicar para loop infinito
    origCards.forEach(c => track.appendChild(c.cloneNode(true)));
    origCards.forEach(c => track.prepend(c.cloneNode(true)));

    const allCards = () => Array.from(track.children);

    const GAP      = 18;
    const SCALE_ON = 1.08;
    const SCALE_OFF= 0.90;
    const DUR      = 380;
    let cur = N, busy = false;

    function cw() { return allCards()[0].offsetWidth; }

    function offsetFor(idx) {
        const step = cw() + GAP;
        return -(idx * step - (wrapper.offsetWidth / 2 - cw() / 2));
    }

    function jumpTo(idx) {
        track.style.transition = "none";
        track.style.transform  = `translateX(${offsetFor(idx)}px)`;
        cur = idx;
        updateScale();
    }

    function slideTo(idx) {
        busy = true;
        track.style.transition = `transform ${DUR}ms cubic-bezier(.4,0,.2,1)`;
        track.style.transform  = `translateX(${offsetFor(idx)}px)`;
        cur = idx;
        updateScale();
        setTimeout(() => {
            busy = false;
            if (cur < N)         jumpTo(cur + N);
            else if (cur >= N*2) jumpTo(cur - N);
        }, DUR + 10);
    }

    function updateScale() {
        allCards().forEach((card, i) => {
            const on = i === cur;
            card.style.transition = `transform ${DUR}ms cubic-bezier(.4,0,.2,1), box-shadow ${DUR}ms ease, opacity ${DUR}ms ease`;
            card.style.transform  = `scale(${on ? SCALE_ON : SCALE_OFF})`;
            card.style.opacity    = on ? "1" : "0.55";
            card.style.boxShadow  = on ? "0 20px 48px rgba(0,0,0,.22)" : "none";
            // Activar/desactivar rotación de imágenes según si es la card activa
            if (card._imgSetActive) card._imgSetActive(on);
        });
    }

    btnNext.addEventListener("click", () => { if (!busy) slideTo(cur + 1); });
    btnPrev.addEventListener("click", () => { if (!busy) slideTo(cur - 1); });

    // Drag / swipe
    let sx = null, dx = 0;
    track.addEventListener("mousedown",  e => { sx = e.clientX; });
    track.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive:true });
    window.addEventListener("mousemove", e => { if (sx !== null) dx = e.clientX - sx; }, { passive:true });
    window.addEventListener("touchmove", e => { if (sx !== null) dx = e.touches[0].clientX - sx; }, { passive:true });
    function endDrag() {
        if (sx === null) return;
        sx = null;
        if (Math.abs(dx) > 48 && !busy) slideTo(cur + (dx < 0 ? 1 : -1));
        dx = 0;
    }
    window.addEventListener("mouseup",  endDrag);
    window.addEventListener("touchend", endDrag);

    // Auto-play
    let ap = setInterval(() => { if (!busy) slideTo(cur + 1); }, 3200);
    wrapper.addEventListener("mouseenter", () => clearInterval(ap));
    wrapper.addEventListener("mouseleave", () => {
        ap = setInterval(() => { if (!busy) slideTo(cur + 1); }, 3200);
    });

    requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(N)));
    window.addEventListener("resize", () => jumpTo(cur), { passive:true });
})();

/* ===========================
   IMÁGENES ROTATIVAS
   - .service-card[data-images]: rota SOLO cuando la card es la activa del carrusel
   - (proj-card no existe en la versión actual, pero el código lo soportaría igual)
=========================== */
(function () {

    // Inicializar doble buffer en una card
    function initImgRotation(card) {
        const imgs    = (card.dataset.images || "").split("|").map(s => s.trim()).filter(Boolean);
        if (imgs.length < 2) return; // nada que rotar

        const wrap = card.querySelector(".service-card-img-photo, .proj-card-img");
        if (!wrap) return;

        const imgA = wrap.querySelector("img");
        if (!imgA) return;

        // Estilos de posición absoluta sobre las dos capas
        imgA.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 1.1s ease;z-index:0;";

        const imgB = document.createElement("img");
        imgB.src   = imgs[1]; // precarga la segunda
        imgB.alt   = imgA.alt;
        imgB.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.1s ease;z-index:0;";
        // Insertar antes del overlay ::after (que es CSS, no un nodo real) y antes de .proj-dots
        const dots = wrap.querySelector(".proj-dots");
        wrap.insertBefore(imgB, dots || null);

        // Precargar todas
        imgs.forEach(src => { const i = new Image(); i.src = src; });

        let current = 0, flipped = false, timer = null;

        function goTo(idx) {
            const src = imgs[idx];
            if (flipped) {
                imgB.src = src; imgB.style.opacity = "1"; imgA.style.opacity = "0";
            } else {
                imgA.src = src; imgA.style.opacity = "1"; imgB.style.opacity = "0";
            }
            flipped = !flipped;

            // Actualizar dots si los hay
            const dotEls = wrap.querySelectorAll(".dot");
            dotEls.forEach((d, i) => d.classList.toggle("active", i === idx));

            current = idx;
        }

        function start() {
            if (timer) return;
            timer = setInterval(() => goTo((current + 1) % imgs.length), 2500);
        }
        function stop() {
            clearInterval(timer);
            timer = null;
        }

        // API para que el carrusel la active/desactive
        card._imgSetActive = (active) => {
            if (active) start();
            else stop();
        };

        // Hover: pausar mientras el usuario mira
        card.addEventListener("mouseenter", stop);
        card.addEventListener("mouseleave", () => {
            if (card._imgActive) start();
        });
    }

    // Inicializar todas las service-cards
    document.querySelectorAll(".service-card[data-images]").forEach(card => {
        initImgRotation(card);
        card._imgActive = false;
    });

    // También inicializar proj-cards si existen (autostart)
    document.querySelectorAll(".proj-card[data-images]").forEach((card, i) => {
        initImgRotation(card);
        card._imgActive = true;
        setTimeout(() => { if (card._imgSetActive) card._imgSetActive(true); }, i * 700);
    });

})();

/* ===========================
   SCROLL SUAVE
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        const offset = header ? header.offsetHeight : 66;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior:"smooth" });
    });
});

/* ===========================
   FORMULARIO — fetch async + Formspree
=========================== */
(function () {
    const form = document.getElementById("contactForm");
    const msg  = document.getElementById("formMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const btn    = form.querySelector(".form-submit");
        const nombre = form.querySelector("#nombre").value.trim();
        const mail   = form.querySelector("#mail").value.trim();

        if (!nombre || !mail) {
            showMsg("Por favor completá nombre y e-mail.", "error");
            return;
        }

        btn.textContent = "Enviando…";
        btn.disabled    = true;

        try {
            const res = await fetch(form.action, {
                method:  "POST",
                body:    new FormData(form),
                headers: { "Accept": "application/json" }
            });
            if (res.ok) {
                form.reset();
                showMsg("¡Gracias! Tu consulta fue enviada. Te contactamos a la brevedad.", "ok");
                if (typeof gtag === "function") gtag("event", "generate_lead", { form_id:"contactForm" });
                if (typeof fbq  === "function") fbq("track", "Lead");
            } else {
                showMsg("Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.", "error");
            }
        } catch (_) {
            showMsg("Sin conexión. Revisá tu red e intentá nuevamente.", "error");
        }

        btn.textContent = "Quiero una evaluación";
        btn.disabled    = false;
    });

    function showMsg(text, type) {
        msg.textContent = text;
        msg.className   = `form-msg ${type === "ok" ? "ok" : "error"}`;
        setTimeout(() => { msg.textContent = ""; msg.className = "form-msg"; }, 6000);
    }
})();

/* ===========================
   WHATSAPP — tracking
=========================== */
document.querySelectorAll(".whatsapp-btn, .whatsapp-text").forEach(link => {
    link.addEventListener("click", () => {
        if (typeof gtag === "function") gtag("event", "whatsapp_click");
        if (typeof fbq  === "function") fbq("track", "Contact");
    });
});

/* ===========================
   BLUEPRINT — solo desktop
=========================== */
(function () {
    if (window.matchMedia("(max-width:768px)").matches) return;

    const GRID       = 50;
    const SPEED      = 0.018;
    const LOOP_PAUSE = 2800;

    const PALETTES = {
        light: { line:"43,43,41",    alpha:0.045 },
        dark:  { line:"255,255,255", alpha:0.08  },
    };

    const SECTIONS = [
        { id:"bpProyectos", dark:false },
        { id:"bpAbout",     dark:false },
        { id:"bpProceso",   dark:false },
        { id:"bpCta",       dark:true  },
    ];

    SECTIONS.forEach(({ id, dark }) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        const section = canvas.parentElement;
        const ctx     = canvas.getContext("2d");
        const PAL     = dark ? PALETTES.dark : PALETTES.light;
        const C = PAL.line, A = PAL.alpha;
        let W, H;

        function snap(v) { return Math.round(v / GRID) * GRID; }
        function resize() {
            W = canvas.width  = section.offsetWidth;
            H = canvas.height = section.offsetHeight;
        }

        function makeBlueprint() {
            const items = [];
            const mx1 = W*.05, mx2 = W*.36, mx3 = W*.64, mx4 = W*.95;
            const my1 = H*.04, my2 = H*.96;
            const rr  = (a,b) => a + Math.random()*(b-a);

            [[mx1,my1,mx2,my2],[mx3,my1,mx4,my2]].forEach(([zx1,zy1,zx2,zy2]) => {
                const n  = 1 + Math.floor(Math.random()*2);
                const zh = (zy2-zy1)/n;
                for (let i=0; i<n; i++) {
                    const x = snap(rr(zx1, zx2-GRID*2));
                    const y = snap(zy1 + zh*i + GRID);
                    const w = snap(rr(GRID*2, Math.min(mx2-x, mx4-mx3)-GRID));
                    const h = snap(rr(GRID*1.5, zh-GRID*2));
                    if (w>0 && h>0) items.push({ type:"rect", x, y, w, h });
                }
            });
            [snap(my1+GRID*.5), snap(my2-GRID*.5)].forEach(dy => {
                items.push({ type:"dim", x1:snap(mx1), y1:dy, x2:snap(mx2), y2:dy, label:rr(2,6).toFixed(1)+"m" });
                items.push({ type:"dim", x1:snap(mx3), y1:dy, x2:snap(mx4), y2:dy, label:rr(2,6).toFixed(1)+"m" });
            });
            [[mx1,my1],[mx2,my1],[mx1,my2],[mx2,my2],
             [mx3,my1],[mx4,my1],[mx3,my2],[mx4,my2]].forEach(([ax,ay]) => {
                items.push({ type:"angle", x:snap(ax), y:snap(ay) });
            });
            items.push({ type:"grid_margin", mx1, mx2, mx3, mx4, my1, my2 });
            return items;
        }

        let items=[], progresses=[], t=0, loopTimer=null;
        function reset() { items=makeBlueprint(); progresses=items.map(()=>0); t=0; }

        function seg(x1,y1,x2,y2,p) {
            ctx.beginPath(); ctx.moveTo(x1,y1);
            ctx.lineTo(x1+(x2-x1)*p, y1+(y2-y1)*p); ctx.stroke();
        }

        function drawItem(item, p) {
            const alpha = Math.min(A, A*p*2);
            ctx.strokeStyle = `rgba(${C},${alpha})`;
            ctx.fillStyle   = `rgba(${C},${alpha})`;
            switch (item.type) {
                case "grid_margin": {
                    ctx.lineWidth = .3;
                    ctx.strokeStyle = `rgba(${C},${A*.5*p})`;
                    const {mx1,mx2,mx3,mx4,my1,my2} = item;
                    for (let x=snap(mx1); x<=mx2; x+=GRID) seg(x,my1,x,my2,p);
                    for (let y=snap(my1); y<=my2; y+=GRID) seg(mx1,y,mx2,y,p);
                    for (let x=snap(mx3); x<=mx4; x+=GRID) seg(x,my1,x,my2,p);
                    for (let y=snap(my1); y<=my2; y+=GRID) seg(mx3,y,mx4,y,p);
                    break;
                }
                case "rect": {
                    ctx.lineWidth = .8;
                    const {x,y,w,h} = item;
                    const sides = [[x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]];
                    let rem = 2*(w+h)*p;
                    sides.forEach(([ax,ay,bx,by]) => {
                        if (rem<=0) return;
                        const len = Math.hypot(bx-ax,by-ay);
                        seg(ax,ay,bx,by,Math.min(1,rem/len)); rem-=len;
                    });
                    break;
                }
                case "dim": {
                    if (p<.05) break;
                    ctx.lineWidth=.5; ctx.setLineDash([4,5]);
                    seg(item.x1,item.y1,item.x2,item.y2,Math.min(1,p*1.4));
                    ctx.setLineDash([]);
                    [[item.x1,item.y1],[item.x2,item.y2]].forEach(([tx,ty])=>{
                        ctx.beginPath(); ctx.moveTo(tx,ty-5); ctx.lineTo(tx,ty+5); ctx.stroke();
                    });
                    if (p>.65) {
                        ctx.globalAlpha=A*(p-.65)/.35;
                        ctx.font=`${Math.max(9,W*.007)}px IBM Plex Sans,sans-serif`;
                        ctx.textAlign="center";
                        ctx.fillText(item.label,(item.x1+item.x2)/2,item.y1-7);
                        ctx.globalAlpha=1;
                    }
                    break;
                }
                case "angle": {
                    if (p<.2) break;
                    const sz=Math.min(W,H)*.022, fa=(p-.2)/.8;
                    ctx.lineWidth=.6; ctx.strokeStyle=`rgba(${C},${A*fa})`;
                    ctx.beginPath();
                    ctx.moveTo(item.x+sz,item.y); ctx.lineTo(item.x,item.y); ctx.lineTo(item.x,item.y+sz);
                    ctx.stroke();
                    ctx.beginPath(); ctx.arc(item.x,item.y,1.5,0,Math.PI*2);
                    ctx.fillStyle=`rgba(${C},${A*fa*1.5})`; ctx.fill();
                    break;
                }
            }
        }

        function frame() {
            ctx.clearRect(0,0,W,H);
            let allDone=true;
            items.forEach((item,i)=>{
                if(t>i*18) progresses[i]=Math.min(1,progresses[i]+SPEED);
                if(progresses[i]<1) allDone=false;
                drawItem(item,progresses[i]);
            });
            t++;
            if(allDone&&!loopTimer) loopTimer=setTimeout(()=>{reset();loopTimer=null;},LOOP_PAUSE);
            requestAnimationFrame(frame);
        }

        resize(); reset(); frame();
        new ResizeObserver(()=>{resize();reset();}).observe(section);
    });
})();
