const STORAGE_KEY = "subjectThreeLineFive.capture.v1";
const STOP_SPEED_KMH = 1.5;
const STOP_HOLD_MS = 1200;
const DEFAULT_RADIUS_M = 45;
const ALLOWED_VOICE_LINES = new Set([
  "请立即起步，按语音播报完成考试。",
  "请开始直线行驶",
  "直线行驶已完成",
  "前方路口请掉头",
  "请开始变更车道",
  "前方路口请左转",
  "前方路口请直行",
  "前方会车",
  "前方完成超车",
  "超车项目完成",
  "前方路口请右转",
  "请靠边停车"
]);

const routeEvents = [
  {
    id: "start",
    title: "起点起步",
    detail: "两条车道，起步先进入右1车道。手刹拉下后必须走。",
    voice: "请立即起步，按语音播报完成考试。",
    manual: true,
    tags: ["手动确认", "右1车道"]
  },
  {
    id: "overtake",
    title: "徐盈路上段超车",
    detail: "从右1变到左1，再回到右1。打灯后3秒再动方向。",
    voice: "前方完成超车",
    completionVoice: "超车项目完成",
    turnSignal: "left",
    countdown: true,
    manual: true,
    tags: ["超车", "3秒"]
  },
  {
    id: "lane-change-left",
    title: "变道",
    detail: "打左转灯，回到左1车道。打灯后3秒再动方向。",
    voice: "请开始变更车道",
    turnSignal: "left",
    countdown: true,
    manual: true,
    tags: ["左转灯", "左1车道"]
  },
  {
    id: "straight-accel",
    title: "直线加速",
    detail: "速度达到40后开始计时，保持40-60 km/h共5秒；超过60直接不合格。",
    voice: "请开始直线行驶",
    rule: "acceleration",
    radius: 55,
    tags: ["40-60", "5秒", "超60不合格"]
  },
  {
    id: "fengsong-crosswalk-1",
    title: "凤嵩路路口斑马线停车",
    detail: "到凤嵩路路口斑马线必须停车，速度为0。",
    rule: "stop",
    tags: ["斑马线", "停车"]
  },
  {
    id: "right-turn-fengya",
    title: "风雅路右转弯",
    detail: "直走到风雅路右转弯，打右转灯，3秒后再动方向。",
    voice: "前方路口请右转",
    turnSignal: "right",
    countdown: true,
    manual: true,
    tags: ["右转灯", "3秒"]
  },
  {
    id: "fengya-uturn",
    title: "风雅路掉头",
    detail: "风雅路直走后打左转灯掉头，3秒后再动方向。",
    voice: "前方路口请掉头",
    turnSignal: "left",
    countdown: true,
    manual: true,
    tags: ["掉头", "左转灯"]
  },
  {
    id: "fengya-xuying-crosswalk",
    title: "风雅路和徐盈路路口斑马线停车后左转",
    detail: "斑马线先停车，然后打左转灯左转。",
    voice: "前方路口请左转",
    rule: "stop",
    turnSignal: "left",
    countdown: true,
    manual: true,
    tags: ["斑马线", "停车", "左转"]
  },
  {
    id: "fengsong-crosswalk-2",
    title: "凤嵩路路口斑马线停车",
    detail: "到凤嵩路路口斑马线必须停车，速度为0。",
    rule: "stop",
    tags: ["斑马线", "停车"]
  },
  {
    id: "straight-drive",
    title: "直线行驶",
    detail: "直线行驶保持速度不低于25 km/h。",
    voice: "请开始直线行驶",
    completionVoice: "直线行驶已完成",
    rule: "minSpeed25",
    radius: 60,
    tags: ["不低于25"]
  },
  {
    id: "bus-stop",
    title: "公交站台停车",
    detail: "公交站台必须停车，不设置30 km/h限速。",
    rule: "stop",
    tags: ["公交站", "停车"]
  },
  {
    id: "school-zone",
    title: "学校区域限速",
    detail: "经过学校区域限速30 km/h。",
    rule: "maxSpeed30",
    radius: 60,
    tags: ["学校", "限速30"]
  },
  {
    id: "songshan-uturn",
    title: "嵩山支路掉头",
    detail: "嵩山支路打左转灯掉头，3秒后再动方向。",
    voice: "前方路口请掉头",
    turnSignal: "left",
    countdown: true,
    manual: true,
    tags: ["左转灯", "掉头"]
  },
  {
    id: "pull-over",
    title: "靠边停车",
    detail: "车身距离边线30-50cm，第一版需要手动确认。",
    voice: "请靠边停车",
    manual: true,
    tags: ["手动确认", "30-50cm"]
  }
];

let position = null;
let watchId = null;
let mode = "idle";
let currentIndex = 0;
let eventStartedAt = 0;
let stopStartedAt = 0;
let accelerationHoldMs = 0;
let lastTickAt = 0;
let countdownTimer = null;
let examLog = [];
let capture = loadCapture();

const $ = (id) => document.getElementById(id);

function loadCapture() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { track: [], marks: {} };
  } catch {
    return { track: [], marks: {} };
  }
}

function saveCapture() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capture));
}

function currentSpeedKmh() {
  if (!position) return 0;
  const speed = position.coords.speed;
  return typeof speed === "number" && !Number.isNaN(speed) ? Math.max(0, speed * 3.6) : 0;
}

function nowIso() {
  return new Date().toISOString();
}

function speak(text) {
  if (!text) return;
  if (!ALLOWED_VOICE_LINES.has(text)) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "zh-CN";
  msg.rate = 0.95;
  window.speechSynthesis.speak(msg);
}

function speakEventVoice(event, phase = "start") {
  const text = phase === "complete" ? event.completionVoice : event.voice;
  speak(text);
}

function distanceMeters(a, b) {
  const r = 6371000;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dp = ((b.lat - a.lat) * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function getEventPoint(event) {
  return capture.marks[event.id] || event.point || null;
}

function isInsideEvent(event) {
  if (!position) return false;
  const point = getEventPoint(event);
  if (!point) return true;
  const here = { lat: position.coords.latitude, lng: position.coords.longitude };
  return distanceMeters(here, point) <= (event.radius || DEFAULT_RADIUS_M);
}

function startLocation() {
  if (!("geolocation" in navigator)) {
    $("gpsStatus").textContent = "不支持定位";
    return;
  }
  if (watchId !== null) return;
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      position = pos;
      updateGpsUi();
      if (mode === "capture") recordTrackPoint();
      if (mode === "exam") tickExam();
    },
    (err) => {
      $("gpsStatus").textContent = err.code === 1 ? "定位被拒绝" : "定位失败";
    },
    { enableHighAccuracy: true, maximumAge: 800, timeout: 10000 }
  );
}

function updateGpsUi() {
  const speed = currentSpeedKmh();
  $("gpsStatus").textContent = "定位中";
  $("speedValue").textContent = speed.toFixed(0);
  $("accuracyValue").textContent = position ? Math.round(position.coords.accuracy) : "--";
}

function recordTrackPoint() {
  const last = capture.track[capture.track.length - 1];
  const point = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speedKmh: Number(currentSpeedKmh().toFixed(1)),
    time: nowIso()
  };
  if (!last || distanceMeters(last, point) > 2) {
    capture.track.push(point);
    saveCapture();
    renderCaptureStats();
  }
}

function startExam() {
  startLocation();
  mode = "exam";
  currentIndex = 0;
  eventStartedAt = 0;
  stopStartedAt = 0;
  accelerationHoldMs = 0;
  lastTickAt = performance.now();
  examLog = [];
  renderReport();
  updateCurrentEvent();
  enterEvent(routeEvents[0]);
}

function stopExam() {
  mode = "idle";
  clearCountdown();
  updateFinalResult();
}

function tickExam() {
  const event = routeEvents[currentIndex];
  if (!event) {
    stopExam();
    return;
  }
  if (!eventStartedAt && isInsideEvent(event)) {
    enterEvent(event);
  }
  if (!eventStartedAt) return;
  evaluateEvent(event);
}

function enterEvent(event) {
  eventStartedAt = performance.now();
  stopStartedAt = 0;
  accelerationHoldMs = 0;
  lastTickAt = performance.now();
  $("autoResult").className = "result-badge neutral";
  $("autoResult").textContent = "进行中";
  $("ruleProgress").style.width = "0%";
  speakEventVoice(event);
  updateCurrentEvent();
  if (event.countdown) startCountdown(event);
}

function evaluateEvent(event) {
  const speed = currentSpeedKmh();
  const elapsed = performance.now() - eventStartedAt;
  const delta = performance.now() - lastTickAt;
  lastTickAt = performance.now();

  if (event.rule === "acceleration") {
    if (speed > 60) {
      failEvent(event, `速度 ${speed.toFixed(1)} km/h，超过60，判不合格。`, true);
      return;
    }
    if (speed >= 40 && speed <= 60) {
      accelerationHoldMs += delta;
    }
    const pct = Math.min(100, (accelerationHoldMs / 5000) * 100);
    $("ruleProgress").style.width = `${pct}%`;
    $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，40-60区间累计 ${(accelerationHoldMs / 1000).toFixed(1)} 秒。`;
    if (accelerationHoldMs >= 5000) passEvent(event, "直线加速合格，已保持5秒。");
    return;
  }

  if (event.rule === "stop") {
    if (speed <= STOP_SPEED_KMH) {
      stopStartedAt ||= performance.now();
    } else {
      stopStartedAt = 0;
    }
    const stoppedMs = stopStartedAt ? performance.now() - stopStartedAt : 0;
    $("ruleProgress").style.width = `${Math.min(100, (stoppedMs / STOP_HOLD_MS) * 100)}%`;
    $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，需停车到0；低速保持 ${(stoppedMs / 1000).toFixed(1)} 秒。`;
    if (stoppedMs >= STOP_HOLD_MS) passEvent(event, "停车项目合格。");
    return;
  }

  if (event.rule === "minSpeed25") {
    $("ruleProgress").style.width = `${Math.min(100, (elapsed / 5000) * 100)}%`;
    $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，直线行驶不得低于25。`;
    if (speed < 25 && elapsed > 1200) {
      failEvent(event, `速度 ${speed.toFixed(1)} km/h，低于25。`);
      return;
    }
    if (elapsed >= 5000) passEvent(event, "直线行驶速度合格。");
    return;
  }

  if (event.rule === "maxSpeed30") {
    $("ruleProgress").style.width = `${Math.min(100, (elapsed / 5000) * 100)}%`;
    $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，学校区域不得超过30。`;
    if (speed > 30) {
      failEvent(event, `速度 ${speed.toFixed(1)} km/h，学校区域超过30。`);
      return;
    }
    if (elapsed >= 5000) passEvent(event, "学校区域限速合格。");
    return;
  }

  if (event.manual) {
    $("autoRuleTitle").textContent = event.title;
    $("autoRuleDetail").textContent = "该项目需要人工确认。确认打灯、车道、方向盘3秒规则或靠边距离后点击合格。";
    $("autoResult").textContent = "需手动";
    $("autoResult").className = "result-badge warn";
    $("ruleProgress").style.width = "100%";
  }
}

function passEvent(event, message) {
  logEvent(event, "pass", message, "auto");
  advanceEvent(event, { speakCompletion: false });
}

function failEvent(event, message, fatal = false) {
  logEvent(event, fatal ? "fatal" : "fail", message, "auto");
  $("autoResult").textContent = fatal ? "不合格" : "扣分";
  $("autoResult").className = "result-badge fail";
  if (fatal) {
    mode = "idle";
    updateFinalResult();
  } else {
    advanceEvent(event, { speakCompletion: false });
  }
}

function advanceEvent(event, options = {}) {
  clearCountdown();
  if (options.speakCompletion) speakEventVoice(event, "complete");
  currentIndex += 1;
  eventStartedAt = 0;
  stopStartedAt = 0;
  accelerationHoldMs = 0;
  renderReport();
  updateCurrentEvent();
  if (currentIndex >= routeEvents.length) {
    mode = "idle";
    updateFinalResult();
    return;
  }
  const nextEvent = routeEvents[currentIndex];
  if (mode === "exam" && !getEventPoint(nextEvent)) {
    window.setTimeout(() => {
      if (mode === "exam" && currentIndex < routeEvents.length && !eventStartedAt) {
        enterEvent(routeEvents[currentIndex]);
      }
    }, 250);
  }
}

function logEvent(event, result, message, source) {
  examLog.push({
    id: event.id,
    title: event.title,
    result,
    source,
    message,
    speedKmh: Number(currentSpeedKmh().toFixed(1)),
    time: new Date().toLocaleTimeString("zh-CN", { hour12: false })
  });
}

function manualPass() {
  const event = routeEvents[currentIndex];
  if (!event) return;
  logEvent(event, "pass", "人工确认合格。", "manual");
  advanceEvent(event, { speakCompletion: true });
}

function manualFail() {
  const event = routeEvents[currentIndex];
  if (!event) return;
  logEvent(event, "fail", "人工扣分或判定不合格。", "manual");
  advanceEvent(event, { speakCompletion: false });
}

function skipEvent() {
  const event = routeEvents[currentIndex];
  if (!event) return;
  logEvent(event, "fail", "手动跳过，按漏做记录。", "manual");
  advanceEvent(event, { speakCompletion: false });
}

function startCountdown(event) {
  clearCountdown();
  let left = 3;
  $("autoRuleTitle").textContent = event.title;
  $("autoRuleDetail").textContent = `请打${event.turnSignal === "right" ? "右" : "左"}转向灯，${left}秒后再动方向。`;
  countdownTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearCountdown();
      $("autoRuleDetail").textContent = "三秒已到，请完成动作后手动确认。";
      return;
    }
    $("autoRuleDetail").textContent = `请保持方向不动，剩余${left}秒。`;
  }, 1000);
}

function clearCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

function updateCurrentEvent() {
  const event = routeEvents[currentIndex];
  $("progressValue").textContent = `${Math.min(currentIndex, routeEvents.length)}/${routeEvents.length}`;
  if (!event) {
    $("currentEventTitle").textContent = "考试完成";
    $("currentEventDetail").textContent = "请查看成绩单。";
    $("autoRuleTitle").textContent = "已结束";
    $("autoRuleDetail").textContent = "所有项目已完成。";
    return;
  }
  $("currentEventTitle").textContent = event.title;
  $("currentEventDetail").textContent = event.detail;
  $("autoRuleTitle").textContent = event.title;
  $("autoRuleDetail").textContent = event.rule ? "等待自动评分。" : "该项目需要手动确认。";
}

function updateFinalResult() {
  const fatal = examLog.some((item) => item.result === "fatal");
  const fails = examLog.filter((item) => item.result === "fail" || item.result === "fatal").length;
  $("finalResult").textContent = fatal ? "不合格" : fails ? "有扣分，需复盘" : examLog.length ? "合格" : "尚未开始";
  $("scoreBadge").textContent = `${fails} 扣分`;
  $("scoreBadge").className = `result-badge ${fatal || fails ? "fail" : examLog.length ? "pass" : "neutral"}`;
  renderReport();
}

function renderReport() {
  const list = $("reportList");
  list.innerHTML = "";
  if (!examLog.length) {
    list.innerHTML = '<p class="muted">考试记录会显示在这里。</p>';
    return;
  }
  examLog.forEach((item) => {
    const el = document.createElement("article");
    el.className = `report-item ${item.result === "pass" ? "pass" : "fail"}`;
    el.innerHTML = `<strong>${item.time} ${item.title}</strong><p>${item.message}（${item.source === "auto" ? "自动" : "手动"}，速度 ${item.speedKmh} km/h）</p>`;
    list.appendChild(el);
  });
}

function renderRoute() {
  const timeline = $("routeTimeline");
  const template = $("eventTemplate");
  timeline.innerHTML = "";
  routeEvents.forEach((event, index) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".step-index").textContent = index + 1;
    node.querySelector("h3").textContent = event.title;
    node.querySelector("p").textContent = event.detail;
    const tags = node.querySelector(".tags");
    event.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      tags.appendChild(span);
    });
    timeline.appendChild(node);
  });
}

function renderCaptureSelect() {
  const select = $("captureEventSelect");
  select.innerHTML = "";
  routeEvents.forEach((event, index) => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = `${index + 1}. ${event.title}`;
    select.appendChild(option);
  });
}

function renderCaptureStats() {
  $("trackCount").textContent = capture.track.length;
  $("markedCount").textContent = Object.keys(capture.marks).length;
}

function startCapture() {
  startLocation();
  mode = "capture";
}

function stopCapture() {
  mode = "idle";
}

function markCurrentEvent() {
  if (!position) {
    alert("还没有定位成功，不能标记。");
    return;
  }
  const id = $("captureEventSelect").value;
  capture.marks[id] = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    time: nowIso()
  };
  saveCapture();
  renderCaptureStats();
}

function exportRoute() {
  const data = {
    name: "大众科目三考试5号线",
    exportedAt: nowIso(),
    stopSpeedKmh: STOP_SPEED_KMH,
    events: routeEvents.map((event, index) => ({
      index: index + 1,
      id: event.id,
      title: event.title,
      detail: event.detail,
      rule: event.rule || null,
      manual: Boolean(event.manual),
      turnSignal: event.turnSignal || null,
      point: capture.marks[event.id] || null
    })),
    track: capture.track
  };
  $("routeJson").value = JSON.stringify(data, null, 2);
  navigator.clipboard?.writeText($("routeJson").value).catch(() => {});
}

function clearCapture() {
  if (!confirm("确定清空本机采集的轨迹和项目点？")) return;
  capture = { track: [], marks: {} };
  saveCapture();
  renderCaptureStats();
  $("routeJson").value = "";
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      $(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });
}

function init() {
  bindTabs();
  renderRoute();
  renderCaptureSelect();
  renderCaptureStats();
  renderReport();
  updateCurrentEvent();

  $("startExamBtn").addEventListener("click", startExam);
  $("stopExamBtn").addEventListener("click", stopExam);
  $("enableVoiceBtn").addEventListener("click", () => speak(""));
  $("manualPassBtn").addEventListener("click", manualPass);
  $("manualFailBtn").addEventListener("click", manualFail);
  $("skipEventBtn").addEventListener("click", skipEvent);
  $("startCaptureBtn").addEventListener("click", startCapture);
  $("stopCaptureBtn").addEventListener("click", stopCapture);
  $("markEventBtn").addEventListener("click", markCurrentEvent);
  $("exportRouteBtn").addEventListener("click", exportRoute);
  $("clearCaptureBtn").addEventListener("click", clearCapture);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
