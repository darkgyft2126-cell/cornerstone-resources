/*
 * FAQ data for Cornerstone Chat on the Cornerstone Web Studio homepage.
 *
 * Every answer below is built from Cornerstone's approved facts only:
 * packages and prices, the free sample homepage, the 50/50 deposit terms,
 * the 10-business-day timeline, the Care Plan, and how Cornerstone Chat
 * works. The bot answers only from this list. A question with no confident
 * match runs the lead-capture flow and forwards the question to
 * hello@getcornerstoneweb.com.
 *
 * In the browser this file sets window.CORNERSTONE_CHAT_CONFIG before
 * cornerstone-chat.js loads. Under Node it exports the config for tests.
 */
(function (global) {
  "use strict";

  var config = {
    businessName: "Cornerstone Web Studio",
    email: "hello@getcornerstoneweb.com",
    phone: "(608) 352-0644",
    themeColor: "#1F3A5F",
    greeting: "Hi, this is the Cornerstone Web Studio assistant. Ask me about " +
              "our packages, prices, or how the process works — anything I " +
              "cannot answer goes straight to the owner.",
    faqs: [
      {
        id: "sample",
        intent: null,
        keywords: ["sample", "mockup", "preview", "example", "see", "first"],
        phrases: ["free sample", "sample homepage", "sample page", "see a sample", "before i pay", "free mockup"],
        answer: "We build a sample homepage for your business first, free. You " +
                "see your site before you pay anything. If you like it, you " +
                "approve it and pay the deposit. If you do not, there is no " +
                "cost and no pressure."
      },
      {
        id: "process",
        intent: null,
        keywords: ["process", "steps", "happen", "build", "built", "works"],
        phrases: ["how does it work", "how it works", "the process", "what happens next"],
        answer: "The process has three steps. One: we build a sample homepage " +
                "for your business, free, and you look at it. Two: you approve " +
                "it and pay a 50% deposit. Three: your site goes live in 10 " +
                "business days, and you pay the other 50% on launch. You own " +
                "the site and the domain. There is no contract, and each site " +
                "includes two revision rounds."
      },
      {
        id: "timeline",
        intent: null,
        keywords: ["long", "timeline", "days", "live", "launch", "ready", "weeks", "soon", "takes", "time"],
        phrases: ["how long", "10 business days", "when will my site be live", "how soon", "how much time"],
        answer: "Your site goes live in 10 business days after you approve " +
                "the sample and pay the deposit. You pay the second 50% on " +
                "launch day."
      },
      {
        id: "deposit",
        intent: "payment",
        keywords: ["deposit", "pay", "upfront", "down", "start", "launch"],
        phrases: ["how much deposit", "deposit", "pay up front", "up front", "50 deposit"],
        answer: "You pay 50% as a deposit when you approve your sample site. " +
                "You pay the other 50% when the site goes live. You own the " +
                "site and the domain, and there is no contract."
      },
      {
        id: "careplan",
        intent: null,
        keywords: ["care", "plan", "updates", "update", "maintenance", "month", "monthly", "support", "changes"],
        phrases: ["care plan", "49 a month"],
        answer: "The Care Plan is $49 a month, and it is optional. It covers " +
                "site updates — send us your changes and we make them — and " +
                "updates to your chat answers when your hours, services, or " +
                "prices change. There is no contract."
      },
      {
        id: "packages",
        intent: "price",
        keywords: ["cost", "price", "prices", "pricing", "charge", "packages", "package"],
        phrases: ["how much", "what does it cost", "what are your prices", "how much does a website cost"],
        answer: "Our packages: One-Page Site, $399 one time. Standard Site, " +
                "$799 one time. CMS Site, $999 one time — with the CMS site " +
                "you can update the words and pictures yourself. Cornerstone " +
                "Chat is included with the Standard and CMS sites, and is a " +
                "$99 add-on on the One-Page site. The Care Plan is optional " +
                "at $49 a month."
      },
      {
        id: "chat",
        intent: null,
        keywords: ["chat", "chatbot", "assistant", "bot", "answers", "answer"],
        phrases: ["cornerstone chat", "how does the chat work", "what is cornerstone chat", "the chat"],
        answer: "Cornerstone Chat is the assistant on this page. It answers " +
                "customer questions day and night, and it answers only from " +
                "the facts you give us on one short form — your hours, " +
                "services, and prices, in your own words. It never guesses. A " +
                "question it cannot answer goes to your email with the " +
                "customer's name and contact, so the lead is yours. Chat is " +
                "included with the Standard and CMS sites, and is a $99 " +
                "add-on on the One-Page site. You can try it right here — " +
                "the chat button is at the bottom right of this page."
      },
      {
        id: "start",
        intent: null,
        keywords: ["start", "started", "begin", "email", "contact", "reach", "call", "phone", "number", "hire"],
        phrases: ["how do i start", "get started", "how to start", "email address", "phone number", "contact you"],
        answer: "To start, email hello@getcornerstoneweb.com or call " +
                "(608) 352-0644. Tell us your business name and what you do. " +
                "We build your free sample homepage first — you pay nothing " +
                "until you approve it."
      },
      {
        id: "area",
        intent: "where",
        keywords: ["where", "located", "serve", "area", "states", "nationwide", "local", "country", "near"],
        phrases: ["service area", "where are you located", "do you serve"],
        answer: "We build websites for small businesses across the United " +
                "States. The work is done by email and phone, so your " +
                "location does not matter."
      },
      {
        id: "revisions",
        intent: null,
        keywords: ["revision", "revisions", "rounds", "edits", "change", "changes", "fix"],
        phrases: ["revision rounds", "two revision"],
        answer: "Each site includes two revision rounds. Show us what to " +
                "change, and we change it. After your site is live, the " +
                "Care Plan covers ongoing updates."
      },
      {
        id: "own",
        intent: null,
        keywords: ["own", "domain", "contract", "keep"],
        phrases: ["do i own", "own the site", "own my site", "my domain"],
        answer: "Yes. You own the site and the domain. There is no contract, " +
                "and the site is yours to keep."
      },
      {
        id: "checkup",
        intent: null,
        keywords: ["checkup", "checklist", "test", "audit", "pdf", "download"],
        phrases: ["website checkup", "10 point", "free checkup", "checkup pdf"],
        answer: "The 10-Point Website Checkup is a free self-test on this " +
                "page. It takes about ten minutes on your phone: ten checks " +
                "that show whether your website is sending customers to " +
                "you — or to the next shop on the list. The download button " +
                "is in the checkup section of this page."
      },
      {
        id: "notdo",
        intent: null,
        keywords: ["ecommerce", "store", "shop", "app", "apps", "software", "sell", "cart", "booking system"],
        phrases: ["online store", "e commerce", "web app", "custom app", "sell online", "shopping cart"],
        answer: "We build simple websites for small businesses. We do not " +
                "build e-commerce stores or custom web apps. If you need a " +
                "site that shows your services and brings you customers, " +
                "that is what we do."
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
  global.CORNERSTONE_CHAT_CONFIG = config;
})(typeof window !== "undefined" ? window : globalThis);
