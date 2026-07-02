(function () {
  if (typeof ROUTES !== "undefined") return;
  if (typeof routeEvents === "undefined") return;

  const ACTIVE_ROUTE_KEY = "subjectThree.activeRoute.v1";
  const routes = {
    line5: {
      name: "5号线",
      storageKey: "subjectThreeLineFive.capture.v1",
      events: routeEvents.slice()
    },
    line7: {
      name: "7号线",
      storageKey: "subjectThreeLineSeven.capture.v1",
      events: [
        { id: "line7-start", title: "起点起步", detail: "起点起步，打左转灯；打灯后保持方向盘不动3秒。", voice: "请立即起步，按语音播报完成考试。", turnSignal: "left", countdown: true, manual: true, tags: ["左转灯", "3秒", "手动确认"] },
        { id: "line7-left-turn-lucaibei", title: "左转弯到芦蔡北路", detail: "斑马线停车，打左转灯左转到芦蔡北路；通过路口保持30码以下并有明显踩刹车动作。", voice: "前方路口请左转", rule: "stop", turnSignal: "left", countdown: true, manual: true, tags: ["斑马线停车", "左转灯", "限速30", "踩刹"] },
        { id: "line7-huanan-straight", title: "路口直行", detail: "路口(华南路)斑马线停车；通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["华南路", "斑马线停车", "限速30", "踩刹"] },
        { id: "line7-school", title: "学校区域", detail: "学校30米感应区速度不要超过30，并有明显踩刹车动作。", rule: "maxSpeed30", radius: 60, manual: true, tags: ["学校", "限速30", "踩刹"] },
        { id: "line7-bus-stop-1", title: "公交站停车", detail: "公交站必须停车；通过公交站保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["公交站", "停车", "限速30", "踩刹"] },
        { id: "line7-huawei-uturn", title: "华卫路掉头", detail: "经过路口(华卫路)斑马线停车，同时打左转灯掉头；打灯后保持方向盘不动3秒。", voice: "前方路口请掉头", rule: "stop", turnSignal: "left", countdown: true, manual: true, tags: ["华卫路", "斑马线停车", "左转灯", "掉头"] },
        { id: "line7-bus-stop-2", title: "公交站停车", detail: "公交站必须停车；通过公交站保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["公交站", "停车", "限速30", "踩刹"] },
        { id: "line7-overtake", title: "超车", detail: "打左转灯超车，打右转灯回原车道；之后经过路口(华南路)斑马线停车。", voice: "前方请完成超车", completionVoice: "已完成", rule: "stop", turnSignal: "left", countdown: true, manual: true, tags: ["超车", "左转灯", "右转灯", "华南路停车"] },
        { id: "line7-right-turn", title: "右转弯", detail: "打右转灯右转；打灯后保持方向盘不动3秒，通过路口保持30码以下并有明显踩刹车动作。", voice: "前方路口请右转", turnSignal: "right", countdown: true, manual: true, tags: ["右转灯", "3秒", "限速30", "踩刹"] },
        { id: "line7-lane-change-left", title: "变道", detail: "打左转灯变到左面车道；打灯后保持方向盘不动3秒。", voice: "请开始变更车道", turnSignal: "left", countdown: true, manual: true, tags: ["左转灯", "变到左车道"] },
        { id: "line7-straight-accel", title: "直线加速行驶", detail: "速度在40-60之间；速度到达40后计时5秒，5秒内低于40或超过60扣10分。", voice: "请开始直线行驶", completionVoice: "已完成", rule: "accelerationStrict", radius: 60, manual: true, tags: ["40-60", "5秒", "扣10分"] },
        { id: "line7-xinxie-uturn", title: "新协路掉头", detail: "打左转灯，路口(新协路)斑马线停车后掉头；打灯后保持方向盘不动3秒。", voice: "前方路口请掉头", rule: "stop", turnSignal: "left", countdown: true, manual: true, tags: ["新协路", "斑马线停车", "左转灯", "掉头"] },
        { id: "line7-pull-over", title: "靠边停车", detail: "打右转灯靠边停车，距离边线30-50cm；打灯后保持方向盘不动3秒。", voice: "请靠边停车", turnSignal: "right", countdown: true, manual: true, tags: ["右转灯", "靠边30-50cm", "手动确认"] }
      ]
    },
    line3: {
      name: "3号线",
      storageKey: "subjectThreeLineThree.capture.v1",
      events: [
        { id: "line3-start", title: "起点起步", detail: "起点起步，按5号线起步规则执行。", voice: "请立即起步，按语音播报完成考试。", manual: true, tags: ["起步", "手动确认"] },
        { id: "line3-intersection-1", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-school", title: "学校", detail: "学校区域速度不要超过30，并有明显踩刹车动作。", rule: "maxSpeed30", radius: 60, manual: true, tags: ["学校", "限速30", "踩刹"] },
        { id: "line3-bus-stop", title: "公交站", detail: "公交站必须停车。", rule: "stop", manual: true, tags: ["公交站", "停车"] },
        { id: "line3-intersection-2", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-straight-drive", title: "直线行驶", detail: "直线行驶保持速度不低于25码。", voice: "请开始直线行驶", completionVoice: "直线行驶已完成", rule: "minSpeed25", radius: 60, manual: true, tags: ["直线行驶", "不低于25"] },
        { id: "line3-intersection-3", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-overtake", title: "超车", detail: "按5号线超车规则执行，打灯后保持方向盘不动3秒。", voice: "前方完成超车", completionVoice: "超车项目完成", turnSignal: "left", countdown: true, manual: true, tags: ["超车", "左转灯", "3秒"] },
        { id: "line3-intersection-4", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-right-turn", title: "右转弯", detail: "打右转灯右转，打灯后保持方向盘不动3秒。", voice: "前方路口请右转", turnSignal: "right", countdown: true, manual: true, tags: ["右转灯", "右转", "3秒"] },
        { id: "line3-uturn", title: "掉头", detail: "打左转灯掉头，打灯后保持方向盘不动3秒。", voice: "前方路口请掉头", turnSignal: "left", countdown: true, manual: true, tags: ["掉头", "左转灯", "3秒"] },
        { id: "line3-intersection-5", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-left-turn", title: "左转", detail: "打左转灯左转，打灯后保持方向盘不动3秒。", voice: "前方路口请左转", turnSignal: "left", countdown: true, manual: true, tags: ["左转灯", "左转", "3秒"] },
        { id: "line3-lane-change-right", title: "向右变道", detail: "打右转灯向右变道，打灯后保持方向盘不动3秒。", voice: "请开始变更车道", turnSignal: "right", countdown: true, manual: true, tags: ["右转灯", "向右变道", "3秒"] },
        { id: "line3-intersection-6", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-straight-accel", title: "直线加速行驶", detail: "速度控制在40-60之间，速度达到40后计时5秒；超过60按5号线规则判定。", voice: "请开始直线行驶", rule: "acceleration", radius: 60, manual: true, tags: ["直线加速", "40-60", "5秒"] },
        { id: "line3-intersection-7", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-intersection-8", title: "路口", detail: "路口/斑马线停车，通过路口保持30码以下并有明显踩刹车动作。", rule: "stop", manual: true, tags: ["路口", "斑马线停车", "限速30", "踩刹"] },
        { id: "line3-pull-over", title: "靠边停车", detail: "靠边停车，距离边线30-50cm，手动确认。", voice: "请靠边停车", manual: true, tags: ["靠边停车", "30-50cm", "手动确认"] }
      ]
    }
  };

  ALLOWED_VOICE_LINES.add("前方请完成超车");
  ALLOWED_VOICE_LINES.add("已完成");

  let activeRouteId = localStorage.getItem(ACTIVE_ROUTE_KEY) || "line5";
  if (!routes[activeRouteId]) activeRouteId = "line5";

  function currentRoute() {
    return routes[activeRouteId];
  }

  function syncRouteEvents() {
    routeEvents.length = 0;
    routeEvents.push(...currentRoute().events);
  }

  loadCapture = function () {
    try {
      return JSON.parse(localStorage.getItem(currentRoute().storageKey)) || { track: [], marks: {} };
    } catch {
      return { track: [], marks: {} };
    }
  };

  saveCapture = function () {
    localStorage.setItem(currentRoute().storageKey, JSON.stringify(capture));
  };

  const originalEvaluateEvent = evaluateEvent;
  evaluateEvent = function (event) {
    if (event.rule !== "accelerationStrict") {
      originalEvaluateEvent(event);
      return;
    }
    const speed = currentSpeedKmh();
    const delta = performance.now() - lastTickAt;
    lastTickAt = performance.now();
    if (speed > 60) {
      failEvent(event, `速度 ${speed.toFixed(1)} km/h，超过60，扣10分。`);
      return;
    }
    if (!accelerationHoldMs && speed < 40) {
      $("ruleProgress").style.width = "0%";
      $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，达到40后开始5秒计时。`;
      return;
    }
    if (speed < 40) {
      failEvent(event, `速度 ${speed.toFixed(1)} km/h，5秒内低于40，扣10分。`);
      return;
    }
    accelerationHoldMs += delta;
    $("ruleProgress").style.width = `${Math.min(100, (accelerationHoldMs / 5000) * 100)}%`;
    $("autoRuleDetail").textContent = `当前速度 ${speed.toFixed(1)} km/h，40-60区间连续保持 ${(accelerationHoldMs / 1000).toFixed(1)} 秒。`;
    if (accelerationHoldMs >= 5000) passEvent(event, "直线加速行驶合格，已保持5秒。");
  };

  exportRoute = function () {
    const data = {
      name: `大众科目三考试${currentRoute().name}`,
      routeId: activeRouteId,
      exportedAt: nowIso(),
      stopSpeedKmh: STOP_SPEED_KMH,
      events: routeEvents.map((event, index) => ({ index: index + 1, id: event.id, title: event.title, detail: event.detail, rule: event.rule || null, manual: Boolean(event.manual), turnSignal: event.turnSignal || null, point: capture.marks[event.id] || null })),
      track: capture.track
    };
    $("routeJson").value = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText($("routeJson").value).catch(() => {});
  };

  const switcher = document.createElement("section");
  switcher.className = "route-switcher";
  switcher.innerHTML = '<label class="field"><span>当前线路</span><select id="routeSelect"></select></label>';
  document.querySelector(".hero-panel").after(switcher);

  const style = document.createElement("style");
  style.textContent = ".route-switcher{margin-top:12px;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:12px 14px}.route-switcher .field{margin:0}";
  document.head.appendChild(style);

  function renderRouteSelect() {
    const select = $("routeSelect");
    select.innerHTML = "";
    Object.entries(routes).forEach(([id, route]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = route.name;
      option.selected = id === activeRouteId;
      select.appendChild(option);
    });
    const routeName = currentRoute().name;
    document.querySelector(".app-header h1").textContent = `${routeName}模拟考试`;
    document.title = `科目三 ${routeName}模拟考试`;
  }

  function switchRoute(routeId) {
    if (!routes[routeId] || routeId === activeRouteId) return;
    mode = "idle";
    clearCountdown();
    activeRouteId = routeId;
    localStorage.setItem(ACTIVE_ROUTE_KEY, activeRouteId);
    syncRouteEvents();
    capture = loadCapture();
    examLog = [];
    currentIndex = 0;
    eventStartedAt = 0;
    stopStartedAt = 0;
    accelerationHoldMs = 0;
    renderRouteSelect();
    renderRoute();
    renderCaptureSelect();
    renderCaptureStats();
    renderReport();
    updateCurrentEvent();
  }

  syncRouteEvents();
  capture = loadCapture();
  renderRouteSelect();
  renderRoute();
  renderCaptureSelect();
  renderCaptureStats();
  updateCurrentEvent();
  $("routeSelect").addEventListener("change", (event) => switchRoute(event.target.value));
})();
