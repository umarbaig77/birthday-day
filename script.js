// PERSONALIZATION: change the date below for the countdown (local time).
const birthdayDate = "2026-10-20T00:00:00";
// Change name, birthday label, or the relative path to your optional music file.
// Keep birthdayDate above in sync with birthdayConfig.birthday when changing the date.
// Birthday messages can be edited directly in each HTML file. No photos are needed.
const birthdayConfig = {
  name: "Aliza",
  birthday: "2026-10-20",
  music: "audio/birthday.mp3",
};
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector) => document.querySelector(selector);
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Storage may be unavailable for local files. */
      }
    },
  };
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = birthdayConfig.name));
  document.querySelectorAll(".page-main h1 [data-name]").forEach((el) => {
    if (document.body.querySelector("#wish-button, #final-button"))
      el.textContent = birthdayConfig.name.toUpperCase();
  });
  const ambient = $(".ambient");
  if (ambient) {
    for (let i = 0; i < 38; i++) {
      const dot = document.createElement("span");
      dot.className = "particle";
      dot.style.left = ((i * 37 + 11) % 100) + "%";
      dot.style.top = ((i * 23 + 7) % 100) + "%";
      dot.style.animationDelay = -(i % 5) + "s";
      ambient.appendChild(dot);
    }
  }
  const menu = $(".menu-toggle"),
    nav = $(".nav");
  function closeMenu() {
    if (menu && nav) {
      menu.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
  }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (e) => {
    if (e.target instanceof Node && !$(".site-header")?.contains(e.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMenu();
  });
  let toastTimer;
  function toast(message) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 4000);
  }
  const musicButton = $(".music");
  let audio = null,
    playing = false,
    busy = false;
  // A remembered preference never starts audio automatically; a fresh tap is always required.
  if (store.get("birthdayMusic") === "on" && musicButton)
    {
      musicButton.title = "Music was enabled. Tap to resume.";
      musicButton.querySelector(".music-label").textContent = "Resume";
    }
  musicButton?.addEventListener("click", async () => {
    if (busy) return;
    if (playing) {
      audio?.pause();
      playing = false;
      store.set("birthdayMusic", "off");
      musicButton.setAttribute("aria-pressed", "false");
      musicButton.querySelector(".music-label").textContent = "Music";
      return;
    }
    busy = true;
    try {
      if (!audio) {
        audio = new Audio(birthdayConfig.music);
        audio.loop = true;
        audio.volume = 0.35;
        audio.addEventListener("error", () => {
          playing = false;
          busy = false;
          store.set("birthdayMusic", "off");
          musicButton.setAttribute("aria-pressed", "false");
          musicButton.querySelector(".music-label").textContent = "Music";
          toast("No music today — the birthday vibes are still here. ✨");
        });
      }
      await audio.play();
      playing = true;
      store.set("birthdayMusic", "on");
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.querySelector(".music-label").textContent = "Pause";
    } catch {
      playing = false;
      store.set("birthdayMusic", "off");
      toast("No music today — the birthday vibes are still here. ✨");
    } finally {
      busy = false;
    }
  });
  const countdown = $("#countdown");
  if (countdown) {
    function update() {
      const distance = new Date(birthdayDate).getTime() - Date.now();
      if (!Number.isFinite(distance)) {
        countdown.textContent = "A birthday worth waiting for. ✨";
        return;
      }
      if (distance <= 0) {
        countdown.textContent = "IT'S BIRTHDAY TIME! 🎉";
        return;
      }
      const values = [
        Math.floor(distance / 86400000),
        Math.floor(distance / 3600000) % 24,
        Math.floor(distance / 60000) % 60,
        Math.floor(distance / 1000) % 60,
      ];
      countdown
        .querySelectorAll(".time-value")
        .forEach((el, i) => (el.textContent = String(values[i]).padStart(2, "0")));
    }
    update();
    setInterval(update, 1000);
    const dateLabel = $(".countdown-date");
    if (dateLabel)
      dateLabel.textContent =
        new Date(birthdayConfig.birthday + "T00:00:00").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }) + " · A day worth counting down to";
  }
  // Lightweight shared canvas for confetti and fireworks; only runs while celebrating.
  const canvas = $("#celebration");
  const ctx = canvas?.getContext("2d");
  let pieces = [],
    raf = 0,
    last = 0,
    fireworkUntil = 0,
    nextFirework = 0;
  const palette = ["--gold", "--purple", "--blue", "--pink", "--text"].map((token) =>
    getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
  );
  function sizeCanvas() {
    if (canvas) {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    }
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  function confetti(count = 75) {
    if (!ctx || reduceMotion) return;
    const capped = Math.min(count, innerWidth < 768 ? 65 : 100);
    for (let i = 0; i < capped; i++)
      pieces.push({
        x: innerWidth * 0.5,
        y: innerHeight * 0.42,
        vx: (Math.random() - 0.5) * 13,
        vy: -Math.random() * 10 - 3,
        life: 180,
        kind: "confetti",
        color: palette[i % palette.length],
        spin: Math.random() * 6,
      });
    start();
  }
  function firework() {
    const x = innerWidth * (0.15 + Math.random() * 0.7),
      y = innerHeight * (0.1 + Math.random() * 0.4),
      color = palette[Math.floor(Math.random() * palette.length)];
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI * 2) / 36,
        speed = 2 + Math.random() * 3;
      pieces.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 65,
        kind: "spark",
        color,
        spin: 0,
      });
    }
  }
  function start() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  }
  function draw(now) {
    if (!ctx || !canvas) return;
    const step = Math.min((now - last) / 16.67, 2);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (now < fireworkUntil && now > nextFirework) {
      firework();
      nextFirework = now + 650;
    }
    pieces = pieces.filter((p) => p.life > 0 && p.y < innerHeight + 40);
    for (const p of pieces) {
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += (p.kind === "spark" ? 0.035 : 0.11) * step;
      p.life -= step;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 30);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      if (p.kind === "confetti") {
        p.spin += 0.06 * step;
        ctx.rotate(p.spin);
        ctx.fillRect(-3, -5, 6, 10);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (pieces.length || now < fireworkUntil) {
      raf = requestAnimationFrame(draw);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  $("#wish-button")?.addEventListener("click", () => {
    $(".cake")?.classList.add("wished");
    confetti();
    $("#wish-status").textContent = "Wish successfully launched 🚀✨";
    $("#wish-button").textContent = "Make Another Wish ✨";
  });
  $("#open-letter")?.addEventListener("click", () => {
    $(".envelope-scene")?.classList.add("opened");
    $("#letter-content").hidden = false;
    $("#open-letter").hidden = true;
    confetti(40);
    setTimeout(
      () =>
        $("#letter-content").scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "start",
        }),
      reduceMotion ? 0 : 950,
    );
  });
  $("#open-gift")?.addEventListener("click", () => {
    $(".gift-scene")?.classList.add("gift-open");
    $("#open-gift").hidden = true;
    setTimeout(
      () => {
        $("#surprise-content").hidden = false;
        confetti();
        $("#surprise-content").scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "nearest",
        });
      },
      reduceMotion ? 0 : 800,
    );
  });
  const revealElements = document.querySelectorAll(".scroll-reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    revealElements.forEach((el) => observer.observe(el));
  } else revealElements.forEach((el) => el.classList.add("visible"));
  let secretClicks = Number(store.get("birthdayStarClicks")) || 0;
  $(".secret-star")?.addEventListener("click", () => {
    secretClicks++;
    store.set("birthdayStarClicks", String(secretClicks));
    if (secretClicks >= 5) {
      secretClicks = 0;
      store.set("birthdayStarClicks", "0");
      $("#secret-dialog").showModal();
      confetti(45);
    }
  });
  $("#close-secret")?.addEventListener("click", () => $("#secret-dialog").close());
  $("#final-button")?.addEventListener("click", () => {
    $("#final-intro").hidden = true;
    document.body.classList.add("final-active");
    $("#final-reveal").hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!reduceMotion) {
      fireworkUntil = performance.now() + 10000;
      confetti(100);
      start();
    }
    $("#final-heading").focus({ preventScroll: true });
  });
  // Cleanup keeps animations and audio from running after navigating away.
  window.addEventListener("pagehide", () => {
    audio?.pause();
    cancelAnimationFrame(raf);
  });
})();
