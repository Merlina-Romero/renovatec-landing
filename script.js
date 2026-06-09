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
   SCROLL REVEAL
=========================== */
const reveals = document.querySelectorAll(
    ".about, .services, .before-after-section, .process, .guarantee, .cta"
);
const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.85;
    reveals.forEach(el => {
        if (el.getBoundingClientRect().top < trigger) el.classList.add("active");
    });
};
window.addEventListener("scroll", revealOnScroll);
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

    beforeAfter.addEventListener("mousedown",  e  => { isDragging = true; setPos(e.clientX); });
    window.addEventListener("mousemove",       e  => { if (isDragging) setPos(e.clientX); });
    window.addEventListener("mouseup",         ()  => { isDragging = false; });
    beforeAfter.addEventListener("touchstart", e  => { isDragging = true; setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchmove",       e  => { if (isDragging) setPos(e.touches[0].clientX); }, { passive:true });
    window.addEventListener("touchend",        ()  => { isDragging = false; });

    // posición inicial
    const r = beforeAfter.getBoundingClientRect();
    setPos(r.left + r.width / 2);
}


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

    // Triplicar: before | real | after
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

    // Drag
    let sx = null, dx = 0;
    track.addEventListener("mousedown",  e => { sx = e.clientX; });
    track.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive:true });
    window.addEventListener("mousemove", e => { if (sx !== null) dx = e.clientX - sx; });
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
    wrapper.addEventListener("mouseleave", () => { ap = setInterval(() => { if (!busy) slideTo(cur + 1); }, 3200); });

    // Init
    requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(N)));
    window.addEventListener("resize", () => jumpTo(cur));
})();


/* ===========================
   GALERÍA DE PROYECTOS
   crossfade suave entre imágenes
=========================== */
(function () {
    const cards = document.querySelectorAll(".proj-card");
    if (!cards.length) return;

    cards.forEach((card, cardIdx) => {
        const imgs     = card.dataset.images.split("|");
        const imgWrap  = card.querySelector(".proj-card-img");
        const dots     = card.querySelectorAll(".dot");

        // Tomamos la img existente y la convertimos en capa "base"
        const imgA = imgWrap.querySelector("img");
        imgA.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 1.2s ease;";

        // Creamos segunda capa encima
        const imgB = document.createElement("img");
        imgB.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;";
        imgB.alt = imgA.alt;
        imgWrap.insertBefore(imgB, imgA.nextSibling);

        // El contenedor necesita position:relative (ya lo tiene) y no cortar
        // pero sí necesita que las capas se posicionen bien
        // Aseguramos que el contenedor tenga altura definida via CSS aspect-ratio

        let current  = 0;
        let flipped  = false; // qué capa es la "activa" ahora
        let timer    = null;

        function goTo(idx) {
            const next = imgs[idx];
            if (flipped) {
                // A es la visible, ponemos nueva en B y hacemos crossfade A→B
                imgB.src = next;
                imgB.style.opacity = "1";
                imgA.style.opacity = "0";
            } else {
                // B es la visible (o inicio), ponemos nueva en A
                imgA.src = next;
                imgA.style.opacity = "1";
                imgB.style.opacity = "0";
            }
            flipped = !flipped;
            dots.forEach((d, i) => d.classList.toggle("active", i === idx));
            current = idx;
        }

        function startAuto() {
            timer = setInterval(() => {
                goTo((current + 1) % imgs.length);
            }, 2800);
        }

        function stopAuto() { clearInterval(timer); }

        // Precargamos todas las imágenes
        imgs.forEach(src => { const i = new Image(); i.src = src; });

        // Arranque escalonado
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
=========================== 
const form = document.getElementById("contactForm");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const btn      = form.querySelector(".form-submit");
        const nombre   = form.querySelector("#nombre").value.trim();
        const tel      = form.querySelector("#telefono").value.trim();
        const mail     = form.querySelector("#mail").value.trim();
        const consulta = form.querySelector("#consulta").value.trim();

        if (!nombre || !tel || !mail || !consulta) {
            showMsg("Por favor completá todos los campos.", "error"); return;
        }
        btn.textContent = "Enviando..."; btn.disabled = true;
        setTimeout(() => {
            form.reset();
            btn.textContent = "Enviar consulta"; btn.disabled = false;
            showMsg("¡Gracias! Tu consulta fue enviada. Te contactamos a la brevedad.", "ok");
        }, 1200);
    });
}*/

function showMsg(text, type) {
    let msg = document.getElementById("formMsg");
    if (!msg) {
        msg = document.createElement("p");
        msg.id = "formMsg";
        document.getElementById("contactForm").appendChild(msg);
    }
    msg.textContent = text;
    msg.className   = type === "ok" ? "form-msg ok" : "form-msg error";
    setTimeout(() => { msg.textContent = ""; msg.className = ""; }, 5000);
}

/* ===========================
   BLUEPRINT SYSTEM
   Plano arquitectónico animado
   en secciones con canvas .bp-canvas
   — dibuja en márgenes, nunca
     sobre el contenido central
=========================== */
(function () {

    // ── Config ──────────────────────────────────────────────────────
    const GRID  = 50;       // tamaño celda (igual al CSS)
    const SPEED = 0.018;    // velocidad de dibujado (0-1 por frame)
    const LOOP_PAUSE = 2800;// ms antes de reiniciar

    // Paleta por tipo de sección
    const PALETTES = {
        light: { line:"112,111,111", alpha:0.055 },  // sobre fondos claros
        dark:  { line:"255,255,255", alpha:0.10  },  // sobre fondos oscuros
    };

    // Qué secciones y qué paleta usar
    const SECTIONS = [
        { id:"bpAbout",     dark:false },
        { id:"bpProyectos", dark:false },
        { id:"bpProceso",   dark:false },
        { id:"bpGarantia",  dark:false },
        { id:"bpCta",       dark:true  },
    ];

    SECTIONS.forEach(({ id, dark }) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        const section = canvas.parentElement;
        const ctx     = canvas.getContext("2d");
        const PAL     = dark ? PALETTES.dark : PALETTES.light;
        const C       = PAL.line;
        const A       = PAL.alpha;

        let W, H;

        function resize() {
            W = canvas.width  = section.offsetWidth;
            H = canvas.height = section.offsetHeight;
        }

        // ── Generador de "plano" ──────────────────────────────────
        // Cada plano es un set de primitivas (líneas, rectángulos,
        // cotas, marcas) distribuidas en los 4 márgenes del canvas.
        // El área central (40%-60% X, 20%-80% Y) queda libre.

        function makeBlueprint() {
            const items = [];
            const mx1 = W * .05,  mx2 = W * .38;  // margen izq
            const mx3 = W * .62,  mx4 = W * .95;  // margen der
            const my1 = H * .04,  my2 = H * .96;  // margen top/bot

            // Helper random en rango
            const rr = (a, b) => a + Math.random() * (b - a);
            const snap = v => Math.round(v / GRID) * GRID;

            // ── Rectángulos tipo habitación (márgenes izq/der) ──
            const zones = [
                [mx1, my1, mx2, my2],
                [mx3, my1, mx4, my2],
            ];
            zones.forEach(([zx1, zy1, zx2, zy2]) => {
                // 1-2 rectángulos por zona
                const n = 1 + Math.floor(Math.random() * 2);
                const zh = (zy2 - zy1) / n;
                for (let i = 0; i < n; i++) {
                    const x = snap(rr(zx1, zx2 - GRID*2));
                    const y = snap(zy1 + zh * i + GRID);
                    const w = snap(rr(GRID*2, Math.min(mx2-x, mx4-mx3) - GRID));
                    const h = snap(rr(GRID*1.5, zh - GRID*2));
                    if (w > 0 && h > 0) items.push({ type:"rect", x, y, w, h });
                }
            });

            // ── Líneas de cota (arriba y abajo) ──
            const dimY = [snap(my1 + GRID * .5), snap(my2 - GRID * .5)];
            dimY.forEach(dy => {
                // izquierda
                items.push({ type:"dim",
                    x1: snap(mx1), y1: dy,
                    x2: snap(mx2), y2: dy,
                    label: (rr(2,6)).toFixed(1) + "m"
                });
                // derecha
                items.push({ type:"dim",
                    x1: snap(mx3), y1: dy,
                    x2: snap(mx4), y2: dy,
                    label: (rr(2,6)).toFixed(1) + "m"
                });
            });

            // ── Marcas de ángulo en esquinas ──
            [[mx1,my1],[mx2,my1],[mx1,my2],[mx2,my2],
             [mx3,my1],[mx4,my1],[mx3,my2],[mx4,my2]].forEach(([ax,ay]) => {
                items.push({ type:"angle", x: snap(ax), y: snap(ay) });
            });

            // ── Grid punteado de fondo (solo en márgenes) ──
            items.push({ type:"grid_margin", mx1, mx2, mx3, mx4, my1, my2 });

            return items;
        }

        // ── Animación de dibujado ────────────────────────────────
        let items    = [];
        let progresses = [];
        let t        = 0;
        let loopTimer = null;

        function reset() {
            items      = makeBlueprint();
            progresses = items.map(() => 0);
            t          = 0;
        }

        // Dibuja un segmento parcialmente
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
                    // Zona izquierda
                    for (let x = snap(mx1); x <= mx2; x += GRID) {
                        seg(x, my1, x, my2, p);
                    }
                    for (let y = snap(my1); y <= my2; y += GRID) {
                        seg(mx1, y, mx2, y, p);
                    }
                    // Zona derecha
                    for (let x = snap(mx3); x <= mx4; x += GRID) {
                        seg(x, my1, x, my2, p);
                    }
                    for (let y = snap(my1); y <= my2; y += GRID) {
                        seg(mx3, y, mx4, y, p);
                    }
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
                    // Ticks en extremos
                    const tickH = 6;
                    [[item.x1,item.y1],[item.x2,item.y2]].forEach(([tx,ty]) => {
                        ctx.beginPath();
                        ctx.moveTo(tx, ty - tickH); ctx.lineTo(tx, ty + tickH);
                        ctx.stroke();
                    });
                    // Label
                    if (p > .65) {
                        const la = (p-.65)/.35;
                        ctx.globalAlpha = A * la;
                        ctx.font = `${Math.max(9, W*.007)}px IBM Plex Sans, sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText(
                            item.label,
                            (item.x1+item.x2)/2,
                            item.y1 - 8
                        );
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
                    // Pequeña L
                    ctx.beginPath();
                    ctx.moveTo(x+sz, y); ctx.lineTo(x,y); ctx.lineTo(x, y+sz);
                    ctx.stroke();
                    // Punto de intersección
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
                // Arranque escalonado: cada elemento empieza
                // cuando el anterior lleva un poco avanzado
                const startT = i * 18;
                if (t > startT) {
                    progresses[i] = Math.min(1, progresses[i] + SPEED);
                }
                if (progresses[i] < 1) allDone = false;
                drawItem(item, progresses[i]);
            });

            t++;

            if (allDone && !loopTimer) {
                loopTimer = setTimeout(() => {
                    reset();
                    loopTimer = null;
                }, LOOP_PAUSE);
            }

            requestAnimationFrame(frame);
        }

        // ── Init ─────────────────────────────────────────────────
        resize();
        reset();
        frame();

        new ResizeObserver(() => {
            resize();
            reset();
        }).observe(section);

        function snap(v) { return Math.round(v / GRID) * GRID; }
    });

})();
