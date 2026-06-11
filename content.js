console.log("[PID] content.js loaded");

let bypass = false;

function findInput() {
  return (
    document.querySelector("#prompt-textarea") ||
    document.querySelector('[contenteditable="true"]') ||
    document.querySelector("textarea")
  );
}

function getText(el) {
  return el.value || el.innerText || el.textContent || "";
}

function setText(el, text) {
  el.focus();

  if ("value" in el) {
    el.value = text;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
}

function findSendButton() {
  return (
    document.querySelector('button[data-testid="send-button"]') ||
    document.querySelector('button[aria-label*="Send"]') ||
    document.querySelector('button[aria-label*="send"]')
  );
}

function showStatus(message, isPass) {
  if (!window.PID_CONFIG.showStatusPopup) return;

  const old = document.getElementById("pid-status-box");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "pid-status-box";
  box.innerText = message;

  box.style.position = "fixed";
  box.style.right = "20px";
  box.style.bottom = "20px";
  box.style.zIndex = "999999";
  box.style.padding = "14px 18px";
  box.style.borderRadius = "10px";
  box.style.fontSize = "16px";
  box.style.fontWeight = "bold";
  box.style.color = "white";
  box.style.background = isPass ? "#16a34a" : "#dc2626";
  box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";

  document.body.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 3000);
}

document.addEventListener(
  "keydown",
  function (e) {
    if (bypass) return;
    if (e.key !== "Enter" || e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const input = findInput();
    if (!input) return;

    const original = getText(input).trim();
    if (!original) return;

    if (original.includes("The ONLY Trusted Instruction:")) {
      console.log("[PID] Already protected. Sending directly.");
      bypass = true;

      const btn = findSendButton();
      if (btn) btn.click();

      setTimeout(() => {
        bypass = false;
      }, 1000);

      return;
    }

    const result = window.checkPromptRules(original);

    console.log("[PID] Original:", original);
    console.log("[PID] Rule result:", result);

    if (!result.pass && window.PID_CONFIG.blockDangerousPrompt) {
      showStatus("⚠️ BLOCKED: " + result.rule, false);
      console.warn("[PID] Blocked:", result.reason);
      return;
    }

    showStatus("✅ PASS: Prompt is safe", true);

    const protectedPrompt = window.buildProtectedPrompt(original);

    console.log("[PID] Protected:", protectedPrompt);

    setText(input, protectedPrompt);

    if (!window.PID_CONFIG.autoSendAfterPass) return;

    bypass = true;

    setTimeout(() => {
      const btn = findSendButton();

      if (btn) {
        btn.click();
        console.log("[PID] Protected prompt sent.");
      } else {
        console.log("[PID] Send button not found.");
      }

      setTimeout(() => {
        bypass = false;
      }, 1200);
    }, 700);
  },
  true
);