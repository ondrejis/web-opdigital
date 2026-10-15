/**
 * OP Digital – hlavní skript
 * Alpine.js (interakce) + Motion (scroll/reveal animace).
 * Vše respektuje prefers-reduced-motion.
 */
import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import collapse from "@alpinejs/collapse";
import { animate } from "motion/mini";
import { inView, scroll, stagger } from "motion";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");
if (reducedMotion) document.documentElement.classList.add("reduced-motion");

/* ------------------------------------------------------------------ */
/* Alpine komponenty                                                   */
/* ------------------------------------------------------------------ */

// Rotující slovo v hero titulku (psací stroj: smaže → napíše další)
Alpine.data("rotator", (words, { typeMs = 55, deleteMs = 30, holdMs = 2200 } = {}) => ({
  words,
  index: 0,
  text: reducedMotion ? words[0] : "",
  deleting: false,
  timer: null,
  init() {
    if (reducedMotion || words.length < 2) {
      this.text = words[0];
      return;
    }
    this.tick();
  },
  destroy() {
    clearTimeout(this.timer);
  },
  tick() {
    const full = this.words[this.index];
    if (!this.deleting) {
      this.text = full.slice(0, this.text.length + 1);
      if (this.text === full) {
        this.deleting = true;
        this.timer = setTimeout(() => this.tick(), holdMs);
        return;
      }
      this.timer = setTimeout(() => this.tick(), typeMs);
    } else {
      this.text = full.slice(0, this.text.length - 1);
      if (this.text === "") {
        this.deleting = false;
        this.index = (this.index + 1) % this.words.length;
      }
      this.timer = setTimeout(() => this.tick(), deleteMs);
    }
  },
}));

// Hlavička: průhledná nahoře, plná po scrollu + mobilní menu
Alpine.data("header", () => ({
  open: false,
  scrolled: false,
  init() {
    const onScroll = () => (this.scrolled = window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    this.$watch("open", (v) => (document.body.style.overflow = v ? "hidden" : ""));
  },
}));

// Čítač čísel (výsledky případovek)
Alpine.data("counter", (target, { duration = 1400, suffix = "" } = {}) => ({
  value: reducedMotion ? target : 0,
  done: reducedMotion,
  suffix,
  start() {
    if (this.done) return;
    this.done = true;
    const from = 0;
    const startAt = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      this.value = Math.round(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
}));

// Kontaktní formulář – POST na endpoint, bez endpointu fallback na mailto
Alpine.data("contactForm", (endpoint, fallbackEmail) => ({
  name: "",
  email: "",
  message: "",
  status: "idle", // idle | sending | sent | error
  async submit() {
    if (!endpoint) {
      const subject = encodeURIComponent(`Poptávka z webu – ${this.name}`);
      const body = encodeURIComponent(`${this.message}\n\n${this.name}\n${this.email}`);
      window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      return;
    }
    this.status = "sending";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: this.name, email: this.email, message: this.message }),
      });
      this.status = res.ok ? "sent" : "error";
    } catch {
      this.status = "error";
    }
  },
}));

// Cookie lišta (localStorage, bez třetích stran)
Alpine.data("cookies", () => ({
  show: false,
  consent: null,
  init() {
    try {
      this.consent = localStorage.getItem("op-cookies");
    } catch {}
    this.show = !this.consent;
    window.addEventListener("op:cookies", () => (this.show = true));
  },
  set(value) {
    this.consent = value;
    this.show = false;
    try {
      localStorage.setItem("op-cookies", value);
    } catch {}
    window.dispatchEvent(new CustomEvent("op:consent", { detail: value }));
  },
}));

// Akordeon (FAQ)
Alpine.data("accordion", () => ({
  active: null,
  toggle(i) {
    this.active = this.active === i ? null : i;
  },
}));

Alpine.plugin(intersect);
Alpine.plugin(collapse);
window.Alpine = Alpine;
Alpine.start();

/* ------------------------------------------------------------------ */
/* Motion – scroll animace                                             */
/* ------------------------------------------------------------------ */
if (!reducedMotion) {
  // Reveal jednotlivých prvků
  inView(
    "[data-reveal]",
    (el) => {
      const isClip = el.dataset.reveal === "clip";
      const delay = Number(el.dataset.revealDelay || 0);
      animate(
        el,
        isClip ? { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], opacity: [0, 1] } : { opacity: [0, 1], y: [24, 0] },
        { duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }
      );
    },
    { margin: "0px 0px -6% 0px" }
  );

  // Skupinové (stagger) revealy
  inView(
    "[data-reveal-group]",
    (group) => {
      const items = group.querySelectorAll("[data-reveal-item]");
      items.forEach((i) => (i.style.opacity = 0));
      animate(items, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, delay: stagger(0.08), ease: [0.2, 0.8, 0.2, 1] });
    },
    { margin: "0px 0px -6% 0px" }
  );

  // Manifest: slova se rozsvěcují podle pozice scrollu
  document.querySelectorAll("[data-words]").forEach((el) => {
    const words = el.querySelectorAll(".word");
    scroll(
      (progress) => {
        const on = Math.round(progress * words.length);
        words.forEach((w, i) => w.classList.toggle("is-on", i < on));
      },
      { target: el, offset: ["start 85%", "end 45%"] }
    );
  });

  // Hero paralaxa: zvětšení + ztmavení při scrollu
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const target = hero.querySelector("[data-hero-scale]");
    scroll(animate(target, { scale: [1, 1.15], opacity: [1, 0] }, { ease: "linear" }), {
      target: hero,
      offset: ["start start", "end start"],
    });
  }

  // Horizontální posun velkých čísel/textu na pozadí
  document.querySelectorAll("[data-drift]").forEach((el) => {
    const dir = el.dataset.drift === "left" ? -1 : 1;
    scroll(animate(el, { x: [0, 160 * dir] }, { ease: "linear" }), {
      target: el.closest("section") || el,
      offset: ["start end", "end start"],
    });
  });
}
