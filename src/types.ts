/** One beat of the narrative flow shown in the full-screen flow. */
export interface FollowUpScene {
  /** Small line shown above the headline (used mainly on the opening scene). */
  kicker?: string;
  headline: string;
  /** Quoted line, rendered with its citation via `reference` when both are set. */
  verse?: string;
  reference?: string;
}

/** Copy for the contact screen shown after the visitor says they'd like to
 * hear more. The channel names (WhatsApp, Telegram, Messenger) are brand
 * names and stay untranslated — only the hints under them are localized. */
export interface ContactStrings {
  title: string;
  intro: string;
  whatsappHint: string;
  telegramHint: string;
  messengerHint: string;
  /** Sits before `emailAction` on one line: "Prefer email? Write to us". */
  emailPrompt: string;
  emailAction: string;
  /** Prefilled message placed in the text input when opening messaging apps or email. */
  prefilledMessage?: string;
}

/** All localized copy for one language: the teaser popup, the two final
 * response buttons, the five narrative scenes, and the contact screen. */
export interface FollowUpStrings {
  popupHeadline: string;
  popupBody: string;
  learnMoreButton: string;
  interestedButton: string;
  notNowButton: string;
  scenes: readonly FollowUpScene[];
  contact: ContactStrings;
}
