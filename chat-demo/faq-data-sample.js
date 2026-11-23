/*
 * Sample FAQ data for Cornerstone Chat — FICTIONAL business, sample content.
 *
 * "Northside Plumbing Co. (Sample)" does not exist. Every price, claim, and
 * detail below is invented for the demo. On a real customer site, this file
 * is built from the answers the business wrote on its FAQ intake form
 * (chatbot-faq-intake.md), word for word — the business owns the wording.
 *
 * In the browser this file sets window.CORNERSTONE_CHAT_CONFIG before
 * cornerstone-chat.js loads. Under Node it exports the config for tests.
 */
(function (global) {
  "use strict";

  var config = {
    businessName: "Northside Plumbing Co. (Sample)",
    email: "hello@northsideplumbing.example",
    phone: "(555) 014-2900",
    themeColor: "#175e9e",
    greeting: "Hi, this is the Northside Plumbing Co. (Sample) assistant. " +
              "Ask me about hours, services, or prices — anything I cannot " +
              "answer goes straight to the owner.",
    faqs: [
      {
        id: "hours",
        intent: "hours",
        keywords: ["hours", "open", "close", "closed", "saturday", "sunday", "weekend", "monday", "friday"],
        phrases: ["what are your hours", "when are you open", "when do you close", "are you open"],
        answer: "We are open Monday to Friday, 7:00 a.m. to 5:00 p.m., and Saturday, " +
                "8:00 a.m. to noon. We are closed on Sundays. Emergency calls are " +
                "answered 24 hours a day, 7 days a week."
      },
      {
        id: "services",
        intent: null,
        keywords: ["services", "service", "offer", "fix", "repair", "install", "replace",
                   "drain", "drains", "water", "heater", "heaters", "leak", "leaks",
                   "toilet", "faucet", "sewer", "pipe", "pipes", "plumbing", "plumber", "clog", "clogged"],
        phrases: ["what services", "do you fix", "do you repair", "do you install", "what do you do"],
        answer: "We handle drain cleaning, leak repair, water heater repair and " +
                "replacement, toilet and faucet repair, sewer line service, and " +
                "pipe repair. If you are not sure whether we do a job, ask here " +
                "and I will pass the question to the owner."
      },
      {
        id: "pricing",
        intent: "price",
        keywords: ["cost", "price", "prices", "pricing", "much", "charge", "estimate", "estimates", "quote", "fee"],
        phrases: ["how much", "service call cost", "free estimate", "free estimates", "what does it cost"],
        answer: "Free estimates. Most service calls start at $89. After we look at " +
                "the job, you get the full price in writing before any work " +
                "starts — no hourly surprises."
      },
      {
        id: "booking",
        intent: "book",
        keywords: ["book", "appointment", "schedule", "quote", "request", "visit", "come out"],
        phrases: ["how do i book", "make an appointment", "request a quote", "get a quote", "schedule a visit", "book an appointment"],
        answer: "To book, call (555) 014-2900 or use the contact form on this page. " +
                "Tell us what is wrong and two times that work for you, and we " +
                "will confirm your appointment the same business day."
      },
      {
        id: "response",
        intent: null,
        keywords: ["fast", "soon", "respond", "response", "wait", "long", "arrive", "start", "same day", "next day"],
        phrases: ["how soon", "how fast", "how long", "same day"],
        answer: "We answer calls during business hours right away. Most appointments " +
                "are scheduled within 1 to 2 business days, and emergencies are " +
                "handled the same day."
      },
      {
        id: "payments",
        intent: "payment",
        keywords: ["pay", "payment", "payments", "accept", "take", "credit", "cash", "check", "checks", "financing", "card"],
        phrases: ["payment methods", "credit card", "do you accept", "do you take", "how can i pay"],
        answer: "We accept cash, checks, and all major credit cards. Payment is due " +
                "when the work is finished, unless we agree on a plan in writing " +
                "before the job starts."
      },
      {
        id: "licensed",
        intent: "licensed",
        keywords: ["licensed", "license", "insured", "insurance", "bonded", "certificate"],
        phrases: ["are you licensed", "licensed and insured", "are you insured"],
        answer: "Yes. Northside Plumbing Co. (Sample) is licensed and insured in " +
                "Wisconsin, sample license number MP-000000. You can ask us for a " +
                "copy of our insurance certificate at any time."
      },
      {
        id: "warranty",
        intent: "warranty",
        keywords: ["warranty", "guarantee", "guaranteed", "stand behind"],
        phrases: ["do you guarantee", "warranty on", "do you offer a warranty"],
        answer: "We warranty our labor for 1 year. Parts carry the manufacturer's " +
                "warranty, and we will tell you the length before we install anything."
      },
      {
        id: "area",
        intent: "where",
        keywords: ["area", "areas", "serve", "travel", "located", "where", "town", "city", "radius", "janesville", "beloit", "milton", "edgerton"],
        phrases: ["service area", "do you serve", "where are you", "areas do you serve"],
        answer: "We serve Janesville, Beloit, Milton, and Edgerton, and homes within " +
                "about 25 miles of Janesville. There is no travel charge inside " +
                "that area."
      },
      {
        id: "emergency",
        intent: "emergency",
        keywords: ["emergency", "urgent", "burst", "flooding", "backup", "after hours", "24 7", "night", "sunday night"],
        phrases: ["after hours", "emergency service", "do you offer emergency"],
        answer: "Yes, we offer 24/7 emergency service for burst pipes, major leaks, " +
                "and sewer backups. Call (555) 014-2900 any time — after hours, " +
                "the line goes to the on-call plumber."
      },
      {
        id: "prepare",
        intent: null,
        keywords: ["before", "prepare", "ready", "shutoff", "valve", "clear"],
        phrases: ["before your visit", "before you come", "should i do before", "before the appointment"],
        answer: "Before we arrive, please clear the area under the sink or around " +
                "the fixture, and know where your main water shut-off valve is. " +
                "If water is leaking now, turn that valve off and call us."
      },
      {
        id: "notdo",
        intent: null,
        keywords: ["remodel", "remodeling", "renovation", "kitchen", "septic", "well", "wells", "hvac", "heating", "cooling", "electrical", "roofing"],
        phrases: ["kitchen remodel", "remodel my kitchen", "bathroom remodel", "do you remodel"],
        answer: "Sorry, we don't do kitchen or bathroom remodels, septic systems, " +
                "or well pumps — we focus on plumbing repair and replacement. If " +
                "you like, I can pass your question to the owner, who may be able " +
                "to suggest someone local."
      },
      {
        id: "offer",
        intent: null,
        keywords: ["special", "specials", "offer", "offers", "discount", "discounts", "coupon", "deal", "deals", "promo", "promotion", "savings"],
        phrases: ["any specials", "special offer", "current special", "any deals"],
        answer: "Current special: $25 off your first service call, through " +
                "December 31, 2026. Mention the website special when you book."
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
  global.CORNERSTONE_CHAT_CONFIG = config;
})(typeof window !== "undefined" ? window : globalThis);
