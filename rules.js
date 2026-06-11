window.PID_RULES = [
  {
    name: "Ignore Previous Instructions",
    severity: "high",
    patterns: [
      "ignore previous instructions",
      "ignore all previous instructions",
      "ignore above instructions",
      "disregard previous instructions",
      "forget previous instructions"
    ]
  },
  {
    name: "Prompt Leakage",
    severity: "high",
    patterns: [
      "reveal system prompt",
      "show system prompt",
      "print system prompt",
      "show developer message",
      "reveal developer message",
      "what are your hidden instructions"
    ]
  },
  {
    name: "Fake Completion Attack",
    severity: "high",
    patterns: [
      "### response:",
      "### instruction:",
      "[assistant:]",
      "[system:]",
      "assistant:",
      "system:"
    ]
  },
  {
    name: "HOUYI Separator Pattern",
    severity: "medium",
    patterns: [
      "---",
      "```",
      "<instruction>",
      "</instruction>",
      "new instruction:",
      "follow this instead"
    ]
  }
];

window.checkPromptRules = function (text) {
  const lower = text.toLowerCase();

  for (const rule of window.PID_RULES) {
    for (const pattern of rule.patterns) {
      if (lower.includes(pattern.toLowerCase())) {
        return {
          pass: false,
          rule: rule.name,
          severity: rule.severity,
          pattern: pattern,
          reason: `Blocked by rule: ${rule.name} (${pattern})`
        };
      }
    }
  }

  return {
    pass: true,
    reason: "Prompt passed all rules."
  };
};