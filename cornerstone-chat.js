/*
 * Cornerstone Chat — a small FAQ chatbot widget for static business websites.
 *
 * Built by Cornerstone Web Studio. Vanilla JS, no dependencies, no external
 * calls, no API keys, and NO generative AI: the bot answers only from the
 * FAQ data the business itself supplied on its intake form. A question with
 * no confident FAQ match is never guessed at — the widget runs a short
 * lead-capture flow and hands the question to the business.
 *
 * LEAD TRANSPORT (read this before going live):
 *   By default the lead is handed over with a pre-filled email (a mailto:
 *   link to the business email in the config, subject "Website question
 *   from <name>", body with name, contact, and question). The widget is
 *   honest about this: it tells the visitor "Your email app will open with
 *   the message ready to send" and never claims a message was sent.
 *   PRODUCTION: set `leadEndpoint` in the config to a form-endpoint URL and
 *   the widget will POST the lead as JSON instead and only say "sent" when
 *   the endpoint answers with success. That is the only change needed.
 *
 * Usage on a customer site:
 *   <script>window.CORNERSTONE_CHAT_CONFIG = { ... };</script>
 *   <script src="cornerstone-chat.js"></script>
 * or load a data file that sets the config before this script.
 */
(function (global) {
  "use strict";

  /* =====================================================================
   * Part 1 — pure matching logic. No browser APIs in this part, so it can
   * be loaded and tested in Node (see test-matcher.js).
   * ===================================================================== */

  var STOPWORDS = {
    a: 1, an: 1, the: 1, is: 1, are: 1, was: 1, were: 1, be: 1, been: 1,
    am: 1, do: 1, does: 1, did: 1, can: 1, could: 1, would: 1, should: 1,
    will: 1, shall: 1, i: 1, me: 1, my: 1, we: 1, our: 1, you: 1, your: 1,
    it: 1, its: 1, this: 1, that: 1, there: 1, here: 1, what: 1, when: 1,
    who: 1, whom: 1, which: 1, and: 1, or: 1, of: 1, to: 1, for: 1, on: 1,
    in: 1, at: 1, by: 1, with: 1, from: 1, as: 1, if: 1, so: 1, than: 1,
    then: 1, have: 1, has: 1, had: 1, any: 1, please: 1, just: 1, about: 1,
    get: 1, got: 1, need: 1, want: 1, like: 1, one: 1, some: 1
  };

  // Common question intents. When the query clearly carries one of these
  // intents, an FAQ tagged with the same intent gets a boost.
  var INTENT_SIGNALS = {
    hours: {
      phrases: ["what time", "when do you open", "when do you close"],
      keywords: ["hours", "open", "opens", "opening", "close", "closes", "closed"]
    },
    price: {
      phrases: ["how much"],
      keywords: ["cost", "costs", "price", "prices", "pricing", "charge", "charges", "fee", "fees", "expensive"]
    },
    book: {
      phrases: ["make an appointment", "book an appointment", "schedule an appointment", "set up a visit"],
      keywords: ["book", "booking", "appointment", "appointments", "schedule", "scheduling"]
    },
    where: {
      phrases: ["service area", "where are you located"],
      keywords: ["where", "located", "serve", "serves", "serving", "area", "areas", "travel"]
    },
    warranty: {
      phrases: [],
      keywords: ["warranty", "warranties", "guarantee", "guaranteed", "guarantees"]
    },
    licensed: {
      phrases: ["licensed and insured"],
      keywords: ["licensed", "license", "insured", "insurance", "bonded"]
    },
    emergency: {
      phrases: ["after hours", "24 7"],
      keywords: ["emergency", "emergencies", "urgent"]
    },
    payment: {
      phrases: ["credit card", "payment methods", "do you accept", "do you take"],
      keywords: ["pay", "payment", "payments", "financing", "cash", "check", "checks"]
    }
  };

  function normalize(text) {
    return String(text == null ? "" : text)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Very light stemming: drop a trailing "s" so "heaters" matches "heater"
  // and "hours" matches "hour". Applied to both queries and keywords.
  function stem(token) {
    if (token.length > 3 && token.charAt(token.length - 1) === "s" &&
        token.charAt(token.length - 2) !== "s") {
      return token.slice(0, -1);
    }
    return token;
  }

  function tokenize(text) {
    var norm = normalize(text);
    var out = {};
    if (!norm) return out;
    norm.split(" ").forEach(function (raw) {
      if (!raw || STOPWORDS[raw]) return;
      out[stem(raw)] = 1;
    });
    return out;
  }

  function detectIntents(normQuery, tokens) {
    var found = {};
    Object.keys(INTENT_SIGNALS).forEach(function (intent) {
      var sig = INTENT_SIGNALS[intent];
      var hit = false;
      sig.phrases.forEach(function (p) {
        if (normQuery.indexOf(normalize(p)) !== -1) hit = true;
      });
      sig.keywords.forEach(function (k) {
        if (tokens[stem(normalize(k))]) hit = true;
      });
      if (hit) found[intent] = 1;
    });
    return found;
  }

  function scoreFaq(faq, normQuery, tokens, intents) {
    var score = 0;
    (faq.phrases || []).forEach(function (p) {
      var np = normalize(p);
      if (np && normQuery.indexOf(np) !== -1) score += 10;
    });
    var seen = {};
    (faq.keywords || []).forEach(function (k) {
      var nk = normalize(k);
      if (!nk || seen[nk]) return;
      seen[nk] = 1;
      if (nk.indexOf(" ") !== -1) {
        // Multi-word keyword: treat like a phrase, worth a bit less.
        if (normQuery.indexOf(nk) !== -1) score += 6;
      } else if (tokens[stem(nk)]) {
        score += 3;
      }
    });
    if (faq.intent && intents[faq.intent]) score += 6;
    return score;
  }

  // Minimum score for an answer. A single keyword hit (3) or an intent
  // boost alone (6) is never enough — the bot stays silent and captures a
  // lead instead of guessing.
  var MATCH_THRESHOLD = 8;

  // Returns { faq, score } for the best confident match, or null.
  function matchFaq(faqs, question) {
    var normQuery = normalize(question);
    if (!normQuery) return null;
    var tokens = tokenize(question);
    var intents = detectIntents(normQuery, tokens);
    var best = null;
    var bestScore = 0;
    (faqs || []).forEach(function (faq) {
      var s = scoreFaq(faq, normQuery, tokens, intents);
      if (s > bestScore) {
        bestScore = s;
        best = faq;
      }
    });
    if (best && bestScore >= MATCH_THRESHOLD) {
      return { faq: best, score: bestScore };
    }
    return null;
  }

  var HUMAN_PHRASES = [
    "talk to a person", "talk to someone", "speak to a person",
    "speak to someone", "real person", "a human", "human please",
    "talk to the owner", "speak to the owner", "talk to a human",
    "customer service", "representative", "call me", "have someone call"
  ];

  function isHumanRequest(text) {
    var n = normalize(text);
    for (var i = 0; i < HUMAN_PHRASES.length; i++) {
      if (n.indexOf(HUMAN_PHRASES[i]) !== -1) return true;
    }
    return false;
  }

  function looksLikeContact(text) {
    var t = String(text || "").trim();
    if (/@/.test(t) && /\./.test(t)) return true;      // simple email check
    var digits = t.replace(/[^0-9]/g, "");
    return digits.length >= 7;                          // simple phone check
  }

  var matcherApi = {
    normalize: normalize,
    tokenize: tokenize,
    detectIntents: detectIntents,
    scoreFaq: scoreFaq,
    matchFaq: matchFaq,
    isHumanRequest: isHumanRequest,
    looksLikeContact: looksLikeContact,
    MATCH_THRESHOLD: MATCH_THRESHOLD
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = matcherApi;
  }

  /* =====================================================================
   * Part 2 — browser widget. Skipped entirely under Node.
   * ===================================================================== */
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  function sanitizeColor(value, fallback) {
    if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())) {
      return value.trim();
    }
    return fallback;
  }

  function initWidget(config) {
    config = config || {};
    var businessName = config.businessName || "our business";
    var businessEmail = config.email || "";
    var phone = config.phone || "";
    var theme = sanitizeColor(config.themeColor, "#175e9e");
    var faqs = config.faqs || [];
    var greeting = config.greeting ||
      ("Hi, this is the " + businessName + " assistant. Ask me about hours, " +
       "services, or prices — anything I cannot answer goes straight to the owner.");

    /* ---------- styles ---------- */
    var css = [
      ".cc-bubble{position:fixed;right:20px;bottom:20px;z-index:99990;width:60px;height:60px;",
      "border-radius:50%;border:none;background:" + theme + ";color:#fff;cursor:pointer;",
      "box-shadow:0 4px 16px rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;padding:0}",
      ".cc-bubble svg{width:30px;height:30px;fill:#fff}",
      ".cc-bubble:focus-visible{outline:3px solid #111;outline-offset:2px}",
      ".cc-panel{position:fixed;right:20px;bottom:92px;z-index:99991;width:360px;max-width:calc(100vw - 24px);",
      "height:520px;max-height:calc(100vh - 116px);background:#fff;border-radius:14px;overflow:hidden;",
      "box-shadow:0 10px 34px rgba(0,0,0,.32);display:none;flex-direction:column;",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#171717}",
      ".cc-panel.cc-open{display:flex}",
      ".cc-head{background:" + theme + ";color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px}",
      ".cc-head .cc-title{font-weight:700;font-size:15px;line-height:1.2;flex:1}",
      ".cc-head .cc-sub{font-size:11px;opacity:.85;font-weight:400}",
      ".cc-close{background:transparent;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px}",
      ".cc-msgs{flex:1;overflow-y:auto;padding:12px;background:#f6f5f3;display:flex;flex-direction:column;gap:8px}",
      ".cc-msg{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}",
      ".cc-bot{background:#fff;border:1px solid #e2ded8;align-self:flex-start;border-bottom-left-radius:4px}",
      ".cc-user{background:" + theme + ";color:#fff;align-self:flex-end;border-bottom-right-radius:4px}",
      ".cc-msg a{color:" + theme + ";font-weight:600}",
      ".cc-user a{color:#fff}",
      ".cc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e2ded8;background:#fff}",
      ".cc-input{flex:1;border:1px solid #c9c4bc;border-radius:20px;padding:9px 13px;font-size:14px;min-width:0}",
      ".cc-input:focus{outline:2px solid " + theme + ";outline-offset:0;border-color:transparent}",
      ".cc-send{background:" + theme + ";color:#fff;border:none;border-radius:20px;padding:9px 16px;font-size:14px;font-weight:600;cursor:pointer}",
      ".cc-note{font-size:11px;color:#6b665e;padding:0 12px 9px;background:#fff}",
      "@media (max-width:480px){.cc-panel{right:12px;bottom:88px}.cc-bubble{right:14px;bottom:14px}}"
    ].join("");
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------- DOM ---------- */
    var bubble = document.createElement("button");
    bubble.className = "cc-bubble";
    bubble.type = "button";
    bubble.setAttribute("aria-label", "Open chat with " + businessName);
    bubble.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.9 2 11.8c0 2.8 1.5 5.3 3.9 6.9-.2 1.2-.8 2.6-1.7 3.6 2.1-.2 4.1-1 5.6-2 .7.2 1.4.2 2.2.2 5.5 0 10-3.9 10-8.7S17.5 3 12 3z"/></svg>';

    var panel = document.createElement("div");
    panel.className = "cc-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with " + businessName);

    var head = document.createElement("div");
    head.className = "cc-head";
    var titleWrap = document.createElement("div");
    titleWrap.className = "cc-title";
    titleWrap.textContent = businessName;
    var sub = document.createElement("div");
    sub.className = "cc-sub";
    sub.textContent = "Website assistant";
    titleWrap.appendChild(sub);
    var closeBtn = document.createElement("button");
    closeBtn.className = "cc-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.textContent = "×";
    head.appendChild(titleWrap);
    head.appendChild(closeBtn);

    var msgs = document.createElement("div");
    msgs.className = "cc-msgs";

    var form = document.createElement("div");
    form.className = "cc-form";
    var input = document.createElement("input");
    input.className = "cc-input";
    input.type = "text";
    input.placeholder = "Type your question…";
    input.setAttribute("aria-label", "Type your question");
    var sendBtn = document.createElement("button");
    sendBtn.className = "cc-send";
    sendBtn.type = "button";
    sendBtn.textContent = "Send";
    form.appendChild(input);
    form.appendChild(sendBtn);

    var note = document.createElement("div");
    note.className = "cc-note";
    note.textContent = "Answers come from the business's own FAQ list. Anything else is forwarded to the owner.";

    panel.appendChild(head);
    panel.appendChild(msgs);
    panel.appendChild(form);
    panel.appendChild(note);
    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    /* ---------- conversation state ---------- */
    var state = "idle"; // idle | lead-name | lead-contact | lead-confirm
    var lead = { question: "", name: "", contact: "" };
    var greeted = false;

    function addMsg(text, who) {
      var div = document.createElement("div");
      div.className = "cc-msg " + (who === "user" ? "cc-user" : "cc-bot");
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
      return div;
    }

    function openPanel() {
      panel.classList.add("cc-open");
      if (!greeted) {
        greeted = true;
        addMsg(greeting, "bot");
      }
      input.focus();
    }

    function closePanel() {
      panel.classList.remove("cc-open");
      bubble.focus();
    }

    bubble.addEventListener("click", function () {
      if (panel.classList.contains("cc-open")) closePanel();
      else openPanel();
    });
    closeBtn.addEventListener("click", closePanel);

    function startLead(question) {
      lead = { question: question || "", name: "", contact: "" };
      if (lead.question) {
        state = "lead-name";
        addMsg("I don't have that answer, so I'll pass your question straight to " +
               businessName + ". What is your name?", "bot");
      } else {
        state = "lead-question";
        addMsg("Of course. What would you like to ask " + businessName + "?", "bot");
      }
    }

    function finishLead() {
      var subject = "Website question from " + lead.name;
      var bodyText = "Name: " + lead.name + "\n" +
                     "Contact: " + lead.contact + "\n" +
                     "Question: " + lead.question + "\n\n" +
                     "Sent from the chat on the " + businessName + " website.";

      // PRODUCTION TRANSPORT: if a form endpoint is configured, POST the
      // lead as JSON and only report success when the endpoint confirms.
      if (config.leadEndpoint) {
        addMsg("Sending your question to " + businessName + "…", "bot");
        fetch(config.leadEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: lead.name, contact: lead.contact,
            question: lead.question, business: businessName
          })
        }).then(function (res) {
          if (res.ok) {
            addMsg("Thanks, " + lead.name + " — the owner has your question and will reply. " +
                   "Anything else I can help with?", "bot");
          } else {
            mailtoFallback(subject, bodyText);
          }
          state = "idle";
        }).catch(function () {
          mailtoFallback(subject, bodyText);
          state = "idle";
        });
        return;
      }

      // DEMO TRANSPORT: pre-filled email via mailto:. We never claim the
      // message was sent — the visitor's own email app does the sending.
      mailtoFallback(subject, bodyText);
      state = "idle";
    }

    function mailtoFallback(subject, bodyText) {
      var href = "mailto:" + encodeURIComponent(businessEmail) +
                 "?subject=" + encodeURIComponent(subject) +
                 "&body=" + encodeURIComponent(bodyText);
      addMsg("Thanks, " + lead.name + ". Your email app will open with the message " +
             "ready to send — just press send there, and " + businessName +
             " will get your question.", "bot");
      var linkMsg = addMsg("", "bot");
      var a = document.createElement("a");
      a.href = href;
      a.textContent = "Open my email app to send it";
      linkMsg.appendChild(a);
      // Try to open the visitor's email app right away; the link above is
      // the fallback if the browser blocks it.
      window.location.href = href;
    }

    function handleUserText(raw) {
      var text = String(raw || "").trim();
      if (!text) return;
      addMsg(text, "user");

      if (normalize(text) === "cancel" && state !== "idle") {
        state = "idle";
        lead = { question: "", name: "", contact: "" };
        addMsg("No problem — nothing was sent. Ask me something else, or type your question again any time.", "bot");
        return;
      }

      if (state === "lead-question") {
        lead.question = text;
        state = "lead-name";
        addMsg("Got it. What is your name?", "bot");
        return;
      }
      if (state === "lead-name") {
        lead.name = text;
        state = "lead-contact";
        addMsg("Thanks, " + lead.name + ". What is the best phone number or email to reach you?", "bot");
        return;
      }
      if (state === "lead-contact") {
        if (!looksLikeContact(text)) {
          addMsg("That doesn't look like a phone number or an email. Please check it and type it again, or type cancel.", "bot");
          return;
        }
        lead.contact = text;
        state = "lead-confirm";
        addMsg("Here is what I have. Question: \"" + lead.question + "\" — from " +
               lead.name + ", reachable at " + lead.contact + ". " +
               "Reply YES to send it, or type cancel.", "bot");
        return;
      }
      if (state === "lead-confirm") {
        var n = normalize(text);
        if (n === "yes" || n === "y" || n.indexOf("yes") === 0) {
          finishLead();
        } else {
          addMsg("No problem — nothing was sent. Type your question again whenever you're ready.", "bot");
          state = "idle";
        }
        return;
      }

      // state === "idle"
      if (isHumanRequest(text)) {
        startLead("");
        return;
      }
      var match = matchFaq(faqs, text);
      if (match) {
        addMsg(match.faq.answer, "bot");
      } else {
        startLead(text);
      }
    }

    function submitInput() {
      var value = input.value;
      input.value = "";
      handleUserText(value);
    }
    sendBtn.addEventListener("click", submitInput);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        submitInput();
      }
    });

    // Small public API — the demo page uses ask() for its "Try asking" list.
    global.CornerstoneChat = {
      open: openPanel,
      close: closePanel,
      ask: function (question) {
        openPanel();
        handleUserText(question);
      },
      matchFaq: matchFaq
    };
  }

  function boot() {
    if (global.CORNERSTONE_CHAT_CONFIG) {
      initWidget(global.CORNERSTONE_CHAT_CONFIG);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
