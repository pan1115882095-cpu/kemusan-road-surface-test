(function () {
  const stopButton = document.getElementById("stopExamBtn");
  if (!stopButton) return;

  const replacement = stopButton.cloneNode(true);
  stopButton.replaceWith(replacement);

  replacement.addEventListener("click", function () {
    stopExam();
    currentIndex = 0;
    eventStartedAt = 0;
    stopStartedAt = 0;
    accelerationHoldMs = 0;
    lastTickAt = performance.now();
    document.getElementById("autoResult").textContent = "待判定";
    document.getElementById("autoResult").className = "result-badge neutral";
    document.getElementById("ruleProgress").style.width = "0%";
    updateCurrentEvent();
  });
})();
