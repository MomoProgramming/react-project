import { useEffect, useRef } from "react";
import "./CursorTrail.css";

/*
  Flowy red cursor trail with tiny sparkles.
  Tweak the numbers in CONFIG to change how it looks.
*/
const CONFIG = {
  life: 350,          // ms the trail takes to fade out completely (longer = longer trail)
  width: 5,           // thickness of the trail near the cursor (px)
  opacity: 0.4,       // how strong the trail is near the cursor (0 - 1)
  follow: 0.12,       // 0 - 1: lower = lazier, flowier head
  wave: 4,            // how much the tail drifts side to side (px)
  glow: 12,           // glow blur around the trail
  lines: 3,           // number of thin gray lines flowing around the trail (0 = none)
  lineOpacity: 0.3,   // how visible the gray lines are (0 - 1)
  lineSpread: 1,      // how far the gray lines drift from the trail (1 = default)
  sparkleEvery: 25,   // px of mouse movement between sparkles (lower = more sparkles)
  headColor: [190, 10, 35],   // trail colour at the cursor (r, g, b)
  tailColor: [150, 12, 40],    // trail colour near the end (r, g, b)
};

export default function CursorTrail() {
  const ref = useRef(null);

  useEffect(() => {
    // no trail on touch screens or if the visitor asked for less motion
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, raf = 0, running = false;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mouse = { x: 0, y: 0, seen: false, inside: true };
    const head = { x: 0, y: 0 };
    let points = [];       // {x, y, t}
    let sparkles = [];     // {x, y, vx, vy, t, life, size, hot}
    let travelled = 0;

    const mix = (a, b, k) => Math.round(a + (b - a) * k);

    const spawnSparkle = (x, y) => {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.1 + Math.random() * 0.45;
      sparkles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.08,
        t: performance.now(),
        life: 450 + Math.random() * 550,
        size: 0.7 + Math.random() * 1.3,
        hot: Math.random() < 0.4,
      });
    };

    const frame = (now) => {
      ctx.clearRect(0, 0, w, h);

      // smooth head -> flowy motion
      if (mouse.seen) {
        const px = head.x, py = head.y;
        head.x += (mouse.x - head.x) * CONFIG.follow;
        head.y += (mouse.y - head.y) * CONFIG.follow;
        const d = Math.hypot(head.x - px, head.y - py);
        if (mouse.inside && d > 0.4) {
          points.push({ x: head.x, y: head.y, t: now });
          travelled += d;
          while (travelled > CONFIG.sparkleEvery) {
            travelled -= CONFIG.sparkleEvery;
            spawnSparkle(head.x, head.y);
          }
        }
      }

      points = points.filter((p) => now - p.t < CONFIG.life);
      sparkles = sparkles.filter((s) => now - s.t < s.life);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // ----- trail: tapered ribbon, gradient, fading to transparent -----
      const n = points.length;
      if (n > 2) {
        // wavy positions (older points drift a little = flowy)
        const pts = points.map((p, i) => {
          const age = (now - p.t) / CONFIG.life;
          const sway = Math.sin(now / 220 + i * 0.55) * CONFIG.wave * age;
          const sway2 = Math.cos(now / 260 + i * 0.5) * CONFIG.wave * age;
          return { x: p.x + sway, y: p.y + sway2, age };
        });
        // direction (normal) at every point
        for (let i = 0; i < n; i++) {
          const p0 = pts[Math.max(i - 1, 0)], p1 = pts[Math.min(i + 1, n - 1)];
          let dx = p1.x - p0.x, dy = p1.y - p0.y;
          const len = Math.hypot(dx, dy) || 1;
          pts[i].nx = -dy / len;
          pts[i].ny = dx / len;
        }

        // thin transparent gray lines that weave around the trail
        ctx.globalCompositeOperation = "source-over";
        ctx.lineCap = "butt";
        for (let L = 0; L < CONFIG.lines; L++) {
          const amp = (L % 2 ? -1 : 1) * (11 + L * 8) * CONFIG.lineSpread;
          const ph = L * 2.1;
          const fq = 0.36 - L * 0.05;
          for (let i = 1; i < n; i++) {
            const a = pts[i - 1], b = pts[i];
            const age = (a.age + b.age) / 2;
            const k = Math.min(Math.max(1 - age, 0), 1);
            const alpha = Math.pow(k, 1.3) * CONFIG.lineOpacity;
            if (alpha < 0.01) continue;
            const oa = amp * Math.sin(now / 320 + i * fq + ph) * Math.min(a.age * 2.2, 1);
            const ob = amp * Math.sin(now / 320 + (i + 1) * fq + ph) * Math.min(b.age * 2.2, 1);
            ctx.strokeStyle = `rgba(205,205,215,${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x + a.nx * oa, a.y + a.ny * oa);
            ctx.lineTo(b.x + b.nx * ob, b.y + b.ny * ob);
            ctx.stroke();
          }
        }

        // main red ribbon (drawn as joined quads so there are no bead-like blobs)
        ctx.shadowBlur = CONFIG.glow;
        for (let i = 1; i < n; i++) {
          const a = pts[i - 1], b = pts[i];
          const age = (a.age + b.age) / 2;
          const k = Math.min(Math.max(1 - age, 0), 1);
          const alpha = Math.pow(k, 1.6) * CONFIG.opacity;
          if (alpha < 0.01) continue;
          const r = mix(CONFIG.tailColor[0], CONFIG.headColor[0], k);
          const g = mix(CONFIG.tailColor[1], CONFIG.headColor[1], k);
          const bl = mix(CONFIG.tailColor[2], CONFIG.headColor[2], k);
          const col = `rgba(${r},${g},${bl},${alpha})`;
          const ha = Math.max(CONFIG.width * Math.pow(Math.max(1 - a.age, 0), 0.8), 0.4) / 2;
          const hb = Math.max(CONFIG.width * Math.pow(Math.max(1 - b.age, 0), 0.8), 0.4) / 2;
          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.beginPath();
          ctx.moveTo(a.x + a.nx * ha, a.y + a.ny * ha);
          ctx.lineTo(b.x + b.nx * hb, b.y + b.ny * hb);
          ctx.lineTo(b.x - b.nx * hb, b.y - b.ny * hb);
          ctx.lineTo(a.x - a.nx * ha, a.y - a.ny * ha);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
      }

      // ----- sparkles -----
      for (const s of sparkles) {
        const age = (now - s.t) / s.life;
        const twinkle = 0.55 + 0.45 * Math.sin(now / 55 + s.x);
        const alpha = (1 - age) * twinkle;
        const x = s.x + s.vx * (now - s.t) * 0.06;
        const y = s.y + s.vy * (now - s.t) * 0.06;
        const r = s.size * (1 - age * 0.5);
        ctx.fillStyle = s.hot ? `rgba(255,220,226,${alpha})` : `rgba(255,80,110,${alpha})`;
        // tiny 4-point star
        ctx.beginPath();
        ctx.moveTo(x, y - r * 2.2);
        ctx.quadraticCurveTo(x, y, x + r * 2.2, y);
        ctx.quadraticCurveTo(x, y, x, y + r * 2.2);
        ctx.quadraticCurveTo(x, y, x - r * 2.2, y);
        ctx.quadraticCurveTo(x, y, x, y - r * 2.2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // sleep when nothing is left to draw
      if (points.length === 0 && sparkles.length === 0 && Math.hypot(mouse.x - head.x, mouse.y - head.y) < 0.5) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.inside = true;
      if (!mouse.seen) {
        mouse.seen = true;
        head.x = e.clientX;
        head.y = e.clientY;
      }
      wake();
    };
    const onLeave = () => { mouse.inside = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />;
}
