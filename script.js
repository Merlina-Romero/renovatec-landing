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
   NAVBAR SCROLL
=========================== */
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
});


/* ===========================
   NAVBAR MOBILE — hamburguesa
=========================== */
(function () {
    const btn  = document.getElementById("navHamburger");
    const menu = document.getElementById("navMobileMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("open");
        btn.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", isOpen);
        menu.setAttribute("aria-hidden", !isOpen);
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("open");
            btn.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");
        });
    });

    document.addEventListener("click", (e) => {
        if (!header.contains(e.target)) {
            menu.classList.remove("open");
            btn.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");
        }
    });
})();


/* ===========================
   SCROLL REVEAL
=========================== */
const reveals = document.querySelectorAll(
    ".about, .services, .before-after-section, .audience, .process, .guarantee, .social-proof, .cta"
);
const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.85;
    reveals.forEach(el => {
        if (el.getBoundingClientRect().top < trigger) el.classList.add("active");
    });
};
window.addEventListener("scroll", revealOnScroll, { passive:true });
revealOnScroll();


/* ===========================
   BEFORE / AFTER SLIDER
=========================== */
const beforeAfter = document.querySelector(".before-after");

if (beforeAfter) {
    const beforeWrapper = beforeAfter.querySelector(".before-wrapper");
    const sliderLine    = beforeAfter.querySelector(".slider-line");
    const sliderHandle  = beforeAfter.querySelector(".slider-handle");
    let isDragging = false;

    function setPos(x) {
        const rect = beforeAfter.getBoundingClientRect();
        let pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
        beforeWrapper.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        sliderLine.style.left   = `${pct}%`;
        sliderHandle.style.left = `${pct}%`;
    }

    function initCenter() {
        const r = beforeAfter.getBoundingClientRect();
        setPos(r.left + r.width / 2);
    }

    beforeAfter.addEventListener("mousedown",  e  => { isDragging = true; setPos(e.clientX); });
    window.addEventListener("mousemove",       e  => { if (isDragging) setPos(e.clientX); }, { passive:true });
    window.addEventListener("mouseup",         ()  => { isDragging = false; });
    beforeAfter.addEventListener("touchstart", e  => { isDragging = true; setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchmove",       e  => { if (isDragging) setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchend",        ()  => { isDragging = false; });

    window.addEventListener("resize", initCenter, { passive:true });

    initCenter();
}


/* ===========================
   CARRUSEL SERVICIOS
=========================== */
(function () {
    const wrapper = document.querySelector(".services-track-wrapper");
    const track   = document.getElementById("servicesTrack");
    const btnPrev = document.getElementById("srvPrev");
    const btnNext = document.getElementById("srvNext");
    if (!track || !btnPrev || !btnNext) return;

    const origCards = Array.from(track.children);
    const N = origCards.length;

    origCards.forEach(c => track.appendChild(c.cloneNode(true)));
    origCards.forEach(c => track.prepend(c.cloneNode(true)));

    const allCards = () => Array.from(track.children);

    const GAP       = 20;
    const SCALE_ON  = 1.10;
    const SCALE_OFF = 0.88;
    const DUR       = 400;
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
        scale();
    }

    function slideTo(idx) {
        busy = true;
        track.style.transition = `transform ${DUR}ms cubic-bezier(.4,0,.2,1)`;
        track.style.transform  = `translateX(${offsetFor(idx)}px)`;
        cur = idx;
        scale();
        setTimeout(() => {
            busy = false;
            if (cur < N)        jumpTo(cur + N);
            else if (cur >= N*2) jumpTo(cur - N);
        }, DUR + 10);
    }

    function scale() {
        allCards().forEach((card, i) => {
            const on = i === cur;
            card.style.transition = `transform ${DUR}ms cubic-bezier(.4,0,.2,1), box-shadow ${DUR}ms ease, opacity ${DUR}ms ease`;
            card.style.transform  = `scale(${on ? SCALE_ON : SCALE_OFF})`;
            card.style.opacity    = on ? "1" : "0.6";
            card.style.boxShadow  = on ? "0 22px 55px rgba(0,0,0,.2)" : "0 6px 18px rgba(0,0,0,.06)";
        });
    }

    btnNext.addEventListener("click", () => { if (!busy) slideTo(cur + 1); });
    btnPrev.addEventListener("click", () => { if (!busy) slideTo(cur - 1); });

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

    let ap = setInterval(() => { if (!busy) slideTo(cur + 1); }, 3200);
    wrapper.addEventListener("mouseenter", () => clearInterval(ap));
    wrapper.addEventListener("mouseleave", () => { ap = setInterval(() => { if (!busy) slideTo(cur + 1); }, 3200); });

    requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(N)));
    window.addEventListener("resize", () => jumpTo(cur), { passive:true });
})();


/* ===========================
   GALERÍA DE PROYECTOS
=========================== */
(function () {
    const cards = document.querySelectorAll(".proj-card");
    if (!cards.length) return;

    cards.forEach((card, cardIdx) => {
        const imgs    = card.dataset.images.split("|");
        const imgWrap = card.querySelector(".proj-card-img");
        const dots    = card.querySelectorAll(".dot");

        const imgA = imgWrap.querySelector("img");
        imgA.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 1.2s ease;";

        const imgB = document.createElement("img");
        imgB.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;";
        imgB.alt = imgA.alt;
        imgWrap.insertBefore(imgB, imgA.nextSibling);

        let current = 0;
        let flipped = false;
        let timer   = null;

        function goTo(idx) {
            const next = imgs[idx];
            if (flipped) {
                imgB.src = next;
                imgB.style.opacity = "1";
                imgA.style.opacity = "0";
            } else {
                imgA.src = next;
                imgA.style.opacity = "1";
                imgB.style.opacity = "0";
            }
            flipped = !flipped;
            dots.forEach((d, i) => d.classList.toggle("active", i === idx));
            current = idx;
        }

        function startAuto() {
            timer = setInterval(() => { goTo((current + 1) % imgs.length); }, 2800);
        }
        function stopAuto() { clearInterval(timer); }

        imgs.forEach(src => { const i = new Image(); i.src = src; });
        setTimeout(startAuto, cardIdx * 800);

        card.addEventListener("mouseenter", stopAuto);
        card.addEventListener("mouseleave", startAuto);
    });
})();


/* ===========================
   SCROLL SUAVE
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute("href"));
        if (t) t.scrollIntoView({ behavior:"smooth" });
    });
});


/* ===========================
   FORMULARIO
=========================== */
(function () {
    const form = document.getElementById("contactForm");
    const msg  = document.getElementById("formMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const btn = form.querySelector(".form-submit");

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
                method: "POST",
                body:    new FormData(form),
                headers: { "Accept": "application/json" }
            });

            if (res.ok) {
                form.reset();
                showMsg("¡Gracias! Tu consulta fue enviada. Te contactamos a la brevedad.", "ok");
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
   BLUEPRINT SYSTEM
=========================== */
(function () {

    const GRID       = 50;
    const SPEED      = 0.018;
    const LOOP_PAUSE = 2800;

    const PALETTES = {
        light: { line:"112,111,111", alpha:0.055 },
        dark:  { line:"255,255,255", alpha:0.10  },
    };

    const SECTIONS = [
        { id:"bpAbout",      dark:false },
        { id:"bpProyectos",  dark:false },
        { id:"bpProceso",    dark:false },
        { id:"bpGarantia",   dark:false },
        { id:"bpResultados", dark:true  },
        { id:"bpCta",        dark:true  },
    ];

    SECTIONS.forEach(({ id, dark }) => {
        const canvas  = document.getElementById(id);
        if (!canvas) return;

        const section = canvas.parentElement;
        const ctx     = canvas.getContext("2d");
        const PAL     = dark ? PALETTES.dark : PALETTES.light;
        const C       = PAL.line;
        const A       = PAL.alpha;

        let W, H;

        function snap(v) { return Math.round(v / GRID) * GRID; }

        function resize() {
            W = canvas.width  = section.offsetWidth;
            H = canvas.height = section.offsetHeight;
        }

        function makeBlueprint() {
            const items = [];
            const mx1 = W * .05,  mx2 = W * .38;
            const mx3 = W * .62,  mx4 = W * .95;
            const my1 = H * .04,  my2 = H * .96;

            const rr = (a, b) => a + Math.random() * (b - a);

            const zones = [
                [mx1, my1, mx2, my2],
                [mx3, my1, mx4, my2],
            ];
            zones.forEach(([zx1, zy1, zx2, zy2]) => {
                const n  = 1 + Math.floor(Math.random() * 2);
                const zh = (zy2 - zy1) / n;
                for (let i = 0; i < n; i++) {
                    const x = snap(rr(zx1, zx2 - GRID*2));
                    const y = snap(zy1 + zh * i + GRID);
                    const w = snap(rr(GRID*2, Math.min(mx2-x, mx4-mx3) - GRID));
                    const h = snap(rr(GRID*1.5, zh - GRID*2));
                    if (w > 0 && h > 0) items.push({ type:"rect", x, y, w, h });
                }
            });

            const dimY = [snap(my1 + GRID * .5), snap(my2 - GRID * .5)];
            dimY.forEach(dy => {
                items.push({ type:"dim", x1:snap(mx1), y1:dy, x2:snap(mx2), y2:dy, label:(rr(2,6)).toFixed(1)+"m" });
                items.push({ type:"dim", x1:snap(mx3), y1:dy, x2:snap(mx4), y2:dy, label:(rr(2,6)).toFixed(1)+"m" });
            });

            [[mx1,my1],[mx2,my1],[mx1,my2],[mx2,my2],
             [mx3,my1],[mx4,my1],[mx3,my2],[mx4,my2]].forEach(([ax,ay]) => {
                items.push({ type:"angle", x:snap(ax), y:snap(ay) });
            });

            items.push({ type:"grid_margin", mx1, mx2, mx3, mx4, my1, my2 });

            return items;
        }

        let items = [], progresses = [], t = 0, loopTimer = null;

        function reset() {
            items      = makeBlueprint();
            progresses = items.map(() => 0);
            t          = 0;
        }

        function seg(x1, y1, x2, y2, p) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x2-x1)*p, y1 + (y2-y1)*p);
            ctx.stroke();
        }

        function drawItem(item, p) {
            const alpha = Math.min(A, A * p * 2);
            ctx.strokeStyle = `rgba(${C},${alpha})`;
            ctx.fillStyle   = `rgba(${C},${alpha})`;

            switch (item.type) {

                case "grid_margin": {
                    ctx.lineWidth = .35;
                    ctx.strokeStyle = `rgba(${C},${A * .5 * p})`;
                    const { mx1,mx2,mx3,mx4,my1,my2 } = item;
                    for (let x = snap(mx1); x <= mx2; x += GRID) seg(x, my1, x, my2, p);
                    for (let y = snap(my1); y <= my2; y += GRID) seg(mx1, y, mx2, y, p);
                    for (let x = snap(mx3); x <= mx4; x += GRID) seg(x, my1, x, my2, p);
                    for (let y = snap(my1); y <= my2; y += GRID) seg(mx3, y, mx4, y, p);
                    break;
                }

                case "rect": {
                    ctx.lineWidth = .9;
                    const { x, y, w, h } = item;
                    const perim = 2*(w+h);
                    const drawn = perim * p;
                    const sides = [
                        [x,y, x+w,y], [x+w,y, x+w,y+h],
                        [x+w,y+h, x,y+h], [x,y+h, x,y]
                    ];
                    let rem = drawn;
                    sides.forEach(([ax,ay,bx,by]) => {
                        if (rem <= 0) return;
                        const len = Math.hypot(bx-ax, by-ay);
                        const f   = Math.min(1, rem/len);
                        seg(ax, ay, bx, by, f);
                        rem -= len;
                    });
                    break;
                }

                case "dim": {
                    if (p < .05) break;
                    ctx.lineWidth = .6;
                    ctx.setLineDash([4, 4]);
                    seg(item.x1, item.y1, item.x2, item.y2, Math.min(1, p*1.4));
                    ctx.setLineDash([]);
                    const tickH = 6;
                    [[item.x1,item.y1],[item.x2,item.y2]].forEach(([tx,ty]) => {
                        ctx.beginPath();
                        ctx.moveTo(tx, ty - tickH); ctx.lineTo(tx, ty + tickH);
                        ctx.stroke();
                    });
                    if (p > .65) {
                        const la = (p-.65)/.35;
                        ctx.globalAlpha = A * la;
                        ctx.font = `${Math.max(9, W*.007)}px IBM Plex Sans, sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText(item.label, (item.x1+item.x2)/2, item.y1 - 8);
                        ctx.globalAlpha = 1;
                    }
                    break;
                }

                case "angle": {
                    if (p < .2) break;
                    const sz = Math.min(W,H) * .025;
                    const fa = (p-.2)/.8;
                    ctx.lineWidth = .7;
                    ctx.strokeStyle = `rgba(${C},${A*fa})`;
                    const { x, y } = item;
                    ctx.beginPath();
                    ctx.moveTo(x+sz, y); ctx.lineTo(x,y); ctx.lineTo(x, y+sz);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(${C},${A*fa*1.5})`;
                    ctx.fill();
                    break;
                }
            }
        }

        function frame() {
            ctx.clearRect(0, 0, W, H);

            let allDone = true;
            items.forEach((item, i) => {
                const startT = i * 18;
                if (t > startT) progresses[i] = Math.min(1, progresses[i] + SPEED);
                if (progresses[i] < 1) allDone = false;
                drawItem(item, progresses[i]);
            });

            t++;

            if (allDone && !loopTimer) {
                loopTimer = setTimeout(() => { reset(); loopTimer = null; }, LOOP_PAUSE);
            }

            requestAnimationFrame(frame);
        }

        resize();
        reset();
        frame();

        new ResizeObserver(() => { resize(); reset(); }).observe(section);
    });

})();
