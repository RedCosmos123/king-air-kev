const STORAGE_KEY = "base-jumper-arcade-save-v4";

const defaults = {
  scene: "title", name: "", nationality: "British", hair: "Brown",
  complexion: "Fair", top: "T-Shirt", bottoms: "Shorts", sound: true,
};
const nations = ["British", "American", "Australian"];
const cycleValues = {
  nationality: nations,
  hair: ["Blonde", "Brown", "Ginger"],
  complexion: ["Fair", "Light Tan", "Pale Winter"],
  top: ["T-Shirt", "Hoodie", "Vest"],
  bottoms: ["Shorts", "Trousers"],
};
const nationalityStats = {
  British: { money: 2, friends: 1, appeal: 3, flag: "🇬🇧" },
  American: { money: 3, friends: 2, appeal: 1, flag: "🇺🇸" },
  Australian: { money: 2, friends: 3, appeal: 1, flag: "🇦🇺" },
};
const difficulty = {
  Blonde: ["EASY", "Everybody loves a pretty boy.", "👱"],
  Brown: ["MEDIUM", "Just kind of blend in.", "🧑"],
  Ginger: ["HARD", "Life is tough for a ginger.", "🧑‍🦰"],
};
const state = Object.assign({}, defaults, readSave());
if (state.scene === "setup") state.scene = "setup-name";
const app = document.querySelector("#app");
let audio;
let music;

function readSave() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }

function ensureAudio() {
  if (audio) { audio.ctx.resume?.(); return; }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx(), master = ctx.createGain();
  master.gain.value = state.sound ? .18 : 0; master.connect(ctx.destination);
  audio = { ctx, master };
}
function ensureMusic() {
  if (music) return music;
  music = new Audio("assets/audio/arcade-theme.m4a");
  music.loop = true;
  music.preload = "auto";
  music.volume = .78;
  music.muted = !state.sound;
  return music;
}
function startMusic() {
  const track = ensureMusic();
  track.muted = !state.sound;
  if (state.sound) track.play().catch(() => {});
}
function tone(freq, length, type = "square", volume = .12, when = 0) {
  if (!audio || !state.sound) return;
  const t = audio.ctx.currentTime + when, osc = audio.ctx.createOscillator(), gain = audio.ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t); gain.gain.setValueAtTime(.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + .008); gain.gain.exponentialRampToValueAtTime(.0001, t + length);
  osc.connect(gain); gain.connect(audio.master); osc.start(t); osc.stop(t + length + .02);
}
function sfx(type = "tap") { if (!audio || !state.sound) return; tone(type === "confirm" ? 330 : 220, .11, type === "confirm" ? "square" : "triangle", .22); if (type === "confirm") tone(660, .13, "square", .16, .07); }

function shell(content, className = "") {
  return `<section class="game-shell ${className}">${content}<div class="top-actions"><button class="icon-button" data-action="sound" aria-label="Toggle sound">${state.sound ? "♪" : "×"}</button>${state.scene !== "title" ? '<button class="icon-button" data-action="reset" aria-label="Restart game">↺</button>' : ""}</div><div class="toast" id="toast">AUTOSAVED</div></section>`;
}
function animatedSceneLayers(name) {
  if (name === "opening") return `<div class="scene-fx title-fx" aria-hidden="true"><i class="title-flash"></i><i class="title-glint glint-a"></i><i class="title-glint glint-b"></i><i class="title-glint glint-c"></i><i class="title-energy"></i></div>`;
  if (name === "house") return `<div class="scene-fx house-fx" aria-hidden="true"><img class="house-sky-layer" src="assets/house.webp" alt=""><i class="house-sunset"></i><i class="house-window-glow"></i></div>`;
  if (name === "phone") return `<div class="scene-fx phone-fx" aria-hidden="true"><img class="phone-video-layer" src="assets/phone.webp" alt=""><i class="phone-screen-glow"></i></div>`;
  return "";
}
function sceneImage(name, sceneClass, title, controls = "") {
  return shell(`<article class="scene ${sceneClass} is-active"><img class="scene-bg" src="assets/${name}.webp" alt="" draggable="false" />${animatedSceneLayers(name)}<div class="vignette"></div>${title ? `<div class="comic-tag">${title}</div>` : ""}${controls}</article>`);
}
function render() {
  switch (state.scene) {
    case "title": app.innerHTML = sceneImage("opening", "scene--title", "", `<div class="start-wrap"><div class="insert-coin">INSERT COIN</div><button class="neon-button winged-start" data-action="start">CLICK TO PLAY</button></div>`); break;
    case "house": app.innerHTML = sceneImage("house", "scene--house", "HOME", `<div class="story-control"><button class="story-button" data-next="kitchen-wife">CONTINUE</button></div>`); break;
    case "kitchen-wife": app.innerHTML = sceneImage("kitchen", "scene--kitchen", "", `<div class="caption dialogue mum-dialogue"><span class="speaker-chip mum">MUM</span>“Hey everyone, dinner’s almost ready.”</div><div class="story-control"><button class="story-button" data-next="kitchen-kids">NEXT</button></div>`); break;
    case "kitchen-kids": app.innerHTML = sceneImage("kids-closeup", "scene--kitchen scene--kids", "", `<div class="caption dialogue kids-dialogue"><span class="speaker-chip kids">KIDS</span>“Yay!”</div><div class="story-control"><button class="story-button" data-next="phone">CONTINUE</button></div>`); break;
    case "phone": app.innerHTML = sceneImage("phone", "scene--phone", "", `<div class="caption dialogue player-dialogue"><span class="speaker-chip dad">DAD</span>“I’ll be there in a minute. This video is incredible.”</div><div class="story-control"><button class="story-button" data-next="decision">NEXT</button></div>`); break;
    case "decision": app.innerHTML = sceneImage("decision", "scene--decision", "", `<div class="caption quote player-dialogue"><span class="speaker-chip dad">DAD</span>“Fuck yeah, I’m gonna be a BASE jumper.”</div><div class="story-control"><button class="story-button" data-next="setup-name">CONTINUE</button></div>`); break;
    case "setup-name": renderName(); break; case "setup-nationality": renderNationality(); break; case "setup-hair": renderHair(); break; case "setup-complexion": renderComplexion(); break; case "setup-top": renderTop(); break; case "setup-bottoms": renderBottoms(); break; case "setup-confirm": renderConfirm(); break; case "complete": renderComplete(); break;
    default: state.scene = "title"; render();
  }
  bindActions();
}

function figure(size = "full") {
  const topFile = {"T-Shirt":"tshirt", Hoodie:"hoodie", Vest:"vest"}[state.top];
  const hairFile = state.hair.toLowerCase();
  const bottomsFile = state.bottoms.toLowerCase();
  const complexion = state.complexion === "Light Tan" ? "tan" : state.complexion === "Pale Winter" ? "pale" : "fair";
  return `<div class="jumper ${size} skin-${complexion}" aria-label="Character preview with ${state.hair.toLowerCase()} hair, ${state.top.toLowerCase()} and ${state.bottoms.toLowerCase()}"><img src="assets/jumper-${topFile}-${hairFile}-${bottomsFile}.webp" alt="" draggable="false"></div>`;
}
function baseFigure() { return `<div class="jumper full base-jumper" aria-label="Character preview in boxer shorts"><img src="assets/jumper-base.webp" alt="" draggable="false"></div>`; }
function creator(title, step, body, actions) { app.innerHTML = shell(`<section class="creator"><div class="comic-tag creator-tag">BUILD YOUR JUMPER</div><header><span>STEP ${step} / 7</span><h1>${title}</h1></header><main>${body}</main><footer>${actions}</footer></section>`, "creator-shell"); }
function nav(back, next, nextLabel = "CONFIRM") { return `${back ? `<button class="secondary-button" data-next="${back}">BACK</button>` : ""}<button class="primary-button" data-next="${next}">${nextLabel}</button>`; }
function selected(group, value) { return state[group] === value ? "is-selected" : ""; }
function bar(value) { return `<span class="bar">${[1,2,3].map(n => `<i class="${n <= value ? "on" : ""}"></i>`).join("")}</span><b>×${value}</b>`; }

function renderName() { creator("NAME YOUR JUMPER", 1, `<div class="name-stage"><label for="playerName">ENTER NAME</label><input class="name-input" id="playerName" maxlength="8" value="${escapeHtml(state.name)}" placeholder="YOUR NAME" autocomplete="off" />${baseFigure()}</div>`, nav("decision", "setup-nationality")); }
function renderNationality() {
  const ns = nationalityStats[state.nationality];
  creator("CHOOSE NATIONALITY", 2, `<div class="nationality-stage"><div class="flag-carousel"><button class="arrow-button" data-cycle="nationality" data-dir="-1" aria-label="Previous nationality">◀</button><div><div class="giant-flag">${ns.flag}</div><h2>${state.nationality.toUpperCase()}</h2></div><button class="arrow-button" data-cycle="nationality" data-dir="1" aria-label="Next nationality">▶</button></div><div class="bars"><span class="bar-row"><span>MONEY</span>${bar(ns.money)}</span><span class="bar-row"><span>FRIENDS</span>${bar(ns.friends)}</span><span class="bar-row"><span>SEX APPEAL</span>${bar(ns.appeal)}</span></div><aside class="game-hint"><b>GAME HINT</b>Different nationalities carry different multipliers for your final score.</aside></div>`, nav("setup-name", "setup-hair"));
}
function renderHair() {
  const d = difficulty[state.hair];
  creator("CHOOSE DIFFICULTY", 3, `<div class="asset-carousel"><div class="carousel-window"><button class="arrow-button" data-cycle="hair" data-dir="-1" aria-label="Previous hair colour">◀</button><img src="assets/hair-${state.hair.toLowerCase()}.webp" alt="${state.hair} hair"><button class="arrow-button" data-cycle="hair" data-dir="1" aria-label="Next hair colour">▶</button></div><div class="carousel-title ${d[0].toLowerCase()}"><b><em class="hair-label">${state.hair.toUpperCase()}</em><i> · </i><em class="difficulty-label">${d[0]}</em></b><span>${d[1]}</span></div><aside class="game-hint"><b>GAME HINT</b>Choose your hair color to decide how difficult the game will be.</aside></div>`, nav("setup-nationality", "setup-complexion"));
}
function assetCarousel(group, value, prefix, alt, hint) {
  const slug = value.toLowerCase().replaceAll(" ", "-");
  return `<div class="asset-carousel ${group}-carousel"><div class="carousel-window"><button class="arrow-button" data-cycle="${group}" data-dir="-1" aria-label="Previous ${alt}">◀</button><img src="assets/${prefix}-${slug}.webp" alt="${value}"><button class="arrow-button" data-cycle="${group}" data-dir="1" aria-label="Next ${alt}">▶</button></div><div class="carousel-title"><b>${value.toUpperCase()}</b></div><aside class="game-hint"><b>GAME HINT</b>${hint}</aside></div>`;
}
function renderComplexion() { creator("CHOOSE COMPLEXION", 4, assetCarousel("complexion", state.complexion, "skin", "complexion", "Which shade of white are you?"), nav("setup-hair", "setup-top")); }
function renderTop() { creator("CHOOSE YOUR TOP", 5, assetCarousel("top", state.top, "top", "top", "Pick the threads you’re going to run with throughout the game."), nav("setup-complexion", "setup-bottoms")); }
function renderBottoms() { creator("CHOOSE BOTTOMS", 6, assetCarousel("bottoms", state.bottoms, "bottom", "bottoms", "Pick the threads you’re going to run with throughout the game."), nav("setup-top", "setup-confirm")); }
function loadoutStrip() {
  const hair = state.hair.toLowerCase(), skin = state.complexion.toLowerCase().replaceAll(" ","-"), top = state.top.toLowerCase().replaceAll(" ","-"), bottoms = state.bottoms.toLowerCase();
  return `<div class="loadout-strip"><img src="assets/hair-${hair}.webp" alt="${state.hair}"><img src="assets/skin-${skin}.webp" alt="${state.complexion}"><img src="assets/top-${top}.webp" alt="${state.top}"><img src="assets/bottom-${bottoms}.webp" alt="${state.bottoms}"></div>`;
}
function renderConfirm() { const d = difficulty[state.hair][0]; creator("LOCK HIM IN?", 7, `<div class="confirm-stage">${figure()}<div class="character-card"><h2>${escapeHtml(state.name || "UNNAMED")}</h2><p>${nationalityStats[state.nationality].flag} ${state.nationality} · ${state.hair} · ${d}</p>${loadoutStrip()}</div></div>`, nav("setup-bottoms", "complete", "LOCK IN CHARACTER")); }
function renderComplete() { app.innerHTML = shell(`<section class="creator complete career-reveal"><img class="career-bg" src="assets/career-city.webp" alt="Neon city at night"><div class="career-shade"></div><div class="career-logo" aria-label="BASE Jumper — Career Ready"><div class="career-logo-main">BASE JUMPER</div><div class="career-logo-sub">CAREER READY</div><i class="logo-glint glint-one">✦</i><i class="logo-glint glint-two">✦</i></div>${figure()}<div class="character-card"><h1>${escapeHtml(state.name || "JUMPER")}</h1><p>${nationalityStats[state.nationality].flag} ${state.nationality} · ${difficulty[state.hair][0]}</p>${loadoutStrip()}</div><button class="primary-button start-career-button" data-action="start-career">START CAREER</button></section>`, "creator-shell"); }

function bindActions() {
  document.querySelectorAll("[data-next]").forEach(btn => btn.addEventListener("click", () => { if (btn.dataset.next === "setup-nationality") { const input = document.querySelector("#playerName"); state.name = (input?.value || state.name).trim().slice(0,8).toUpperCase(); if (!state.name) { input?.focus(); input?.classList.add("invalid"); return; } } go(btn.dataset.next); }));
  document.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => { state[btn.dataset.choice] = btn.dataset.value; save(); sfx(); render(); showToast(); }));
  document.querySelectorAll("[data-cycle]").forEach(btn => btn.addEventListener("click", () => { const group = btn.dataset.cycle, values = cycleValues[group], i = values.indexOf(state[group]); state[group] = values[(i + Number(btn.dataset.dir) + values.length) % values.length]; save(); sfx(); render(); }));
  document.querySelector("#playerName")?.addEventListener("input", e => { state.name = e.target.value.replace(/[^a-z0-9 '-]/gi, "").slice(0,8).toUpperCase(); e.target.value = state.name; save(); });
  document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "start") { ensureAudio(); startMusic(); sfx("confirm"); go("house"); }
    if (action === "sound") { state.sound = !state.sound; save(); ensureAudio(); if (audio) audio.master.gain.value = state.sound ? .18 : 0; const track = ensureMusic(); track.muted = !state.sound; if (state.sound) track.play().catch(() => {}); render(); }
    if (action === "reset" && confirm("Restart this career from the title screen?")) { localStorage.removeItem(STORAGE_KEY); Object.assign(state, defaults); render(); }
    if (action === "replay-opening") go("title");
    if (action === "start-career") showToast("CAREER MODE · NEXT BUILD");
  }));
}
function go(scene) { state.scene = scene; save(); sfx(); const current = document.querySelector(".scene"); if (current) { current.classList.remove("is-active"); setTimeout(render, 420); } else render(); }
function showToast(message = "AUTOSAVED") { requestAnimationFrame(() => { const t = document.querySelector("#toast"); if (!t) return; t.textContent = message; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1100); }); }
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
render();
