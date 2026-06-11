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
  if (!el) return "";
  return el.value || el.innerText || el.textContent || "";
}

function findSendButton() {
  return (
    document.querySelector('button[data-testid="send-button"]') ||
    document.querySelector('button[aria-label*="Send"]') ||
    document.querySelector('button[type="submit"]')
  );
}

function showStatus(message, isPass) {
  const oldBox = document.getElementById("pid-status-box");
  if (oldBox) oldBox.remove();

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
  setTimeout(() => box.remove(), 2500);
}

function inspectAndSend(event) {
  if (bypass) return;

  const input = findInput();
  if (!input) {
    console.log("[PID] input not found");
    return;
  }

  const originalPrompt = getText(input).trim();
  if (!originalPrompt) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const ruleResult = window.checkPromptRules(originalPrompt);

  console.log("[PID] Original Prompt:", originalPrompt);
  console.log("[PID] Rule Result:", ruleResult);

  if (!ruleResult.pass) {
    showStatus("⚠️ BLOCKED: " + ruleResult.rule, false);
    console.warn("[PID] Blocked:", ruleResult.reason);
    return;
  }

  showStatus("✅ PASS", true);
  console.log("[PID] Safe prompt. Sending...");

  bypass = true;

  setTimeout(() => {
    const sendButton = findSendButton();

    if (sendButton) {
      sendButton.click();
    } else {
      console.log("[PID] send button not found");
    }

    setTimeout(() => {
      bypass = false;
    }, 1000);
  }, 300);
}

// Bắt Enter
document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      inspectAndSend(event);
    }
  },
  true
);

// Bắt click nút Send
document.addEventListener(
  "click",
  function (event) {
    const sendButton = findSendButton();

    if (!sendButton) return;

    if (event.target === sendButton || sendButton.contains(event.target)) {
      inspectAndSend(event);
    }
  },
  true
);