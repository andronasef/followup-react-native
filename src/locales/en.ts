import type { ContactStrings, FollowUpStrings } from "../types";

const enContact: ContactStrings = {
  title: "We're here for you anytime.",
  intro:
    "Whether you have questions, need someone to talk to, or just want to learn more — we'd love to connect. Pick whatever app you're most comfortable with; no pressure, at your own pace.",
  whatsappHint: "Quick & direct chat",
  telegramHint: "Simple & private",
  messengerHint: "Chat on Facebook",
  emailPrompt: "Prefer a thoughtful email?",
  emailAction: "Drop us a note",
  prefilledMessage: "I want to know more about what you are talking about!",
};

// Track 1: Unconditional Love
export const enLove: FollowUpStrings = {
  popupHeadline: "Someone loves you truly — no strings attached.",
  popupBody:
    "You don't have to prove anything or earn it. You are loved just as you are. Take one minute to discover it.",
  learnMoreButton: "Learn More",
  interestedButton: "I'd Like to Hear More",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "Love with no strings attached…",
      headline: "Christ loves you just as you are.",
      verse: "I have loved you with an everlasting love; therefore with lovingkindness I have drawn you.",
      reference: "Jeremiah 31:3",
    },
    {
      headline: "Come to Him just as you are.",
      verse: "He isn't waiting for you to fix yourself first. Open your heart to His love.",
    },
  ],
  contact: enContact,
};

// Track 2: The Healer
export const enHealer: FollowUpStrings = {
  popupHeadline: "Hurting or struggling? There is healing for you.",
  popupBody:
    "Christ can heal any disease, pain, or weakness. Even if you don't believe it, just come and see — you have nothing to lose.",
  learnMoreButton: "Learn More",
  interestedButton: "I Need This Healing",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "When pain wears you down…",
      headline: "Christ has the power to heal.",
      verse: "Surely He took up our pain and bore our suffering… and by His wounds we are healed.",
      reference: "Isaiah 53:4-5",
    },
    {
      headline: "Come and see — you have nothing to lose.",
      verse: "Place your pain in His hands today and experience His healing touch.",
    },
  ],
  contact: enContact,
};

// Track 3: Forgiveness of Sins
export const enForgiveness: FollowUpStrings = {
  popupHeadline: "We all fall short, but God's mercy is greater.",
  popupBody:
    "No matter what you've done, God forgave all our sins and loved us. He's waiting to start a fresh page with you.",
  learnMoreButton: "Learn More",
  interestedButton: "I Want a Fresh Start",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "Weighed down by mistakes?",
      headline: "Mercy is greater than guilt.",
      verse: "Though your sins are like scarlet, they shall be as white as snow.",
      reference: "Isaiah 1:18",
    },
    {
      headline: "Be free from the burden of the past.",
      verse: "He forgave all our sins and loved us. Come and start anew with peace and joy.",
    },
  ],
  contact: enContact,
};

export const enVariants = [enLove, enHealer, enForgiveness] as const;
export const en = enLove;
