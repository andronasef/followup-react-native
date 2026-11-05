var __defProp = Object.defineProperty;
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};

// src/FollowUpGate.tsx
import { useEffect as useEffect6, useRef as useRef2, useState as useState3 } from "react";
import { Modal } from "react-native";
import * as Linking2 from "expo-linking";
import * as Localization from "expo-localization";

// src/FollowUpTracker.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
var OPEN_COUNT_KEY = "follow_up_open_count";
var SHOWN_KEY = "follow_up_shown";
var LAST_DISMISSED_OPEN_KEY = "follow_up_last_dismissed_open";
var recordedThisSession = false;
var FollowUpTracker = class _FollowUpTracker {
  constructor() {
  }
  static async create() {
    return new _FollowUpTracker();
  }
  async getOpenCount() {
    const raw = await AsyncStorage.getItem(OPEN_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  }
  async getHasBeenShown() {
    return await AsyncStorage.getItem(SHOWN_KEY) === "true";
  }
  async getLastDismissedOpen() {
    const raw = await AsyncStorage.getItem(LAST_DISMISSED_OPEN_KEY);
    return raw ? parseInt(raw, 10) : null;
  }
  async markShown() {
    await AsyncStorage.setItem(SHOWN_KEY, "true");
  }
  /** Records that the visitor dismissed the teaser popup, noting the current
   * open count so we can snooze reappearance. */
  async recordDismiss() {
    const count = await this.getOpenCount();
    await AsyncStorage.setItem(LAST_DISMISSED_OPEN_KEY, String(count));
  }
  /** Increments the open counter once per process lifetime. Safe to call on
   * every mount of FollowUpGate. */
  async recordOpen() {
    if (recordedThisSession) return;
    recordedThisSession = true;
    const count = await this.getOpenCount();
    await AsyncStorage.setItem(OPEN_COUNT_KEY, String(count + 1));
  }
  async shouldTrigger(opts) {
    const [shown, count, lastDismissed] = await Promise.all([
      this.getHasBeenShown(),
      this.getOpenCount(),
      this.getLastDismissedOpen()
    ]);
    if (shown) return false;
    if (count < opts.threshold) return false;
    const interval = opts.reappearInterval ?? 10;
    if (lastDismissed !== null && count - lastDismissed < interval) {
      return false;
    }
    return true;
  }
  /** Clears all follow-up state. QA-only, not for production use. */
  async debugReset() {
    recordedThisSession = false;
    await AsyncStorage.multiRemove([OPEN_COUNT_KEY, SHOWN_KEY, LAST_DISMISSED_OPEN_KEY]);
  }
  /** Clears state and pre-sets the open count to `threshold`, so the very
   * next FollowUpGate mount triggers immediately (after its delay). */
  async debugForceReady(opts) {
    await this.debugReset();
    await AsyncStorage.setItem(OPEN_COUNT_KEY, String(opts.threshold));
  }
};

// src/locales/index.ts
var locales_exports = {};
__export(locales_exports, {
  all: () => all,
  allVariants: () => allVariants,
  ar: () => ar,
  arVariants: () => arVariants,
  en: () => en,
  enVariants: () => enVariants,
  es: () => es,
  fr: () => fr,
  hi: () => hi,
  id: () => id,
  isRtl: () => isRtl,
  pt: () => pt,
  resolve: () => resolve,
  resolveLanguageCode: () => resolveLanguageCode,
  rtlLanguageCodes: () => rtlLanguageCodes,
  ru: () => ru,
  sw: () => sw,
  zh: () => zh
});

// src/locales/ar.ts
var arContact = {
  title: "\u0625\u062D\u0646\u0627 \u0647\u0646\u0627 \u062F\u0627\u064A\u0645\u0627\u064B \u0639\u0644\u0634\u0627\u0646\u0643.",
  intro: "\u0633\u0648\u0627\u0621 \u0639\u0646\u062F\u0643 \u0623\u0633\u0626\u0644\u0629\u060C \u062D\u0627\u0628\u0628 \u062A\u0641\u0636\u0641\u0636\u060C \u0623\u0648 \u0639\u0627\u0648\u0632 \u062A\u0639\u0631\u0641 \u0623\u0643\u062A\u0631.. \u064A\u0633\u0639\u062F\u0646\u0627 \u062C\u062F\u0627\u064B \u0646\u062A\u0643\u0644\u0645 \u0645\u0639\u0627\u0643. \u0627\u062E\u062A\u0627\u0631 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0644\u064A \u062A\u0631\u062A\u0627\u062D \u0641\u064A\u0647\u060C \u0648\u0628\u0631\u0627\u062D\u062A\u0643 \u062A\u0645\u0627\u0645\u0627\u064B \u0648\u0641\u064A \u0623\u064A \u0648\u0642\u062A.",
  whatsappHint: "\u0634\u0627\u062A \u0633\u0631\u064A\u0639 \u0648\u0645\u0628\u0627\u0634\u0631",
  telegramHint: "\u0628\u0633\u064A\u0637 \u0648\u0628\u0643\u0644 \u062E\u0635\u0648\u0635\u064A\u0629",
  messengerHint: "\u0643\u0644\u0645\u0646\u0627 \u0639\u0644\u0649 \u0641\u064A\u0633\u0628\u0648\u0643",
  emailPrompt: "\u0628\u062A\u0631\u062A\u0627\u062D \u0623\u0643\u062B\u0631 \u0641\u064A \u0627\u0644\u0625\u064A\u0645\u064A\u0644\u061F",
  emailAction: "\u0631\u0627\u0633\u0644\u0646\u0627 \u0641\u064A \u0623\u064A \u0648\u0642\u062A",
  prefilledMessage: "\u0639\u0627\u0648\u0632 \u0627\u0639\u0631\u0641 \u0639\u0646 \u0627\u0644\u0644\u064A \u0627\u0646\u062A \u0628\u062A\u062A\u0643\u0644\u0645 \u0639\u0646\u0647 \u0627\u0643\u062A\u0631!"
};
var arLove = {
  popupHeadline: "\u0641\u064A\u0647 \u062D\u062F \u0628\u064A\u062D\u0628\u0643 \u0628\u062C\u062F.. \u062D\u0628 \u0645\u0644\u0648\u0634 \u0634\u0631\u0648\u0637.",
  popupBody: "\u0627\u0644\u0645\u0633\u064A\u062D \u0628\u064A\u062D\u0628\u0643 \u062D\u0628 \u062D\u0642\u064A\u0642\u064A \u0648\u0645\u0634 \u0645\u0633\u062A\u0646\u064A \u0645\u0646\u0643 \u062A\u0639\u0645\u0644 \u0623\u064A \u062D\u0627\u062C\u0629 \u0639\u0644\u0634\u0627\u0646 \u064A\u062D\u0628\u0643.. \u062D\u0628\u0643 \u0632\u064A \u0645\u0627 \u0623\u0646\u062A \u0645\u0646 \u063A\u064A\u0631 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C \u062A\u062B\u0628\u062A \u0646\u0641\u0633\u0643. \u062E\u062F \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0639\u0631\u0641 \u0623\u0643\u062A\u0631.",
  learnMoreButton: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064A\u062F",
  interestedButton: "\u0639\u0627\u0648\u0632 \u0623\u0639\u0631\u0641 \u0623\u0643\u062A\u0631",
  notNowButton: "\u0645\u0634 \u062F\u0644\u0648\u0642\u062A\u064A",
  scenes: [
    {
      kicker: "\u062A\u0639\u0628\u062A \u0645\u0646 \u0625\u0631\u0636\u0627\u0621 \u0627\u0644\u0646\u0627\u0633\u061F",
      headline: "\u0627\u0644\u0645\u0633\u064A\u062D \u0628\u064A\u062D\u0628\u0643 \u0632\u064A \u0645\u0627 \u0623\u0646\u062A.",
      verse: "\u0645\u064E\u062D\u064E\u0628\u064E\u0651\u0629\u064B \u0623\u064E\u0628\u064E\u062F\u0650\u064A\u064E\u0651\u0629\u064B \u0623\u064E\u062D\u0652\u0628\u064E\u0628\u0652\u062A\u064F\u0643\u064E.. \u0623\u064E\u062F\u064E\u0645\u0652\u062A\u064F \u0644\u064E\u0643\u064E \u0627\u0644\u0631\u064E\u0651\u062D\u0652\u0645\u064E\u0629\u064E.",
      reference: "\u0625\u0631\u0645\u064A\u0627 31: 3"
    },
    {
      headline: "\u0627\u0641\u062A\u062D \u0644\u0647 \u0642\u0644\u0628\u0643 \u062F\u0644\u0648\u0642\u062A\u064A.",
      verse: "\u0647\u0648 \u0645\u0634 \u0645\u0633\u062A\u0646\u064A\u0643 \u062A\u0635\u0644\u062D \u0646\u0641\u0633\u0643 \u0627\u0644\u0623\u0648\u0644.. \u062A\u0639\u0627\u0644\u064E \u0632\u064A \u0645\u0627 \u0623\u0646\u062A."
    }
  ],
  contact: arContact
};
var arHealer = {
  popupHeadline: "\u062A\u0639\u0628\u0627\u0646 \u0623\u0648 \u0645\u062A\u0623\u0644\u0645\u061F \u0641\u064A\u0647 \u0634\u0641\u0627 \u0648\u0631\u062C\u0627\u0621 \u0644\u064A\u0643.",
  popupBody: "\u0627\u0644\u0645\u0633\u064A\u062D \u0627\u0644\u0634\u0627\u0641\u064A \u064A\u0642\u062F\u0631 \u064A\u0644\u0645\u0633 \u0648\u064A\u0634\u0641\u064A \u0623\u064A \u0645\u0631\u0636 \u0648\u0623\u064A \u0636\u0639\u0641 \u0645\u0647\u0645\u0627 \u0643\u0627\u0646.. \u0648\u0644\u0648 \u0645\u0634 \u0645\u0635\u062F\u0642\u060C \u062A\u0639\u0627\u0644\u0649 \u0628\u0633 \u0648\u062C\u0631\u0628\u060C \u0645\u0634 \u0647\u062A\u062E\u0633\u0631 \u062D\u0627\u062C\u0629.",
  learnMoreButton: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064A\u062F",
  interestedButton: "\u0645\u062D\u062A\u0627\u062C \u0627\u0644\u0634\u0641\u0627\u0621 \u062F\u0647",
  notNowButton: "\u0645\u0634 \u062F\u0644\u0648\u0642\u062A\u064A",
  scenes: [
    {
      kicker: "\u0644\u0645\u0627 \u0627\u0644\u0645\u0631\u0636 \u064A\u0647\u062F \u062D\u064A\u0644\u062A\u0643..",
      headline: "\u0627\u0644\u0645\u0633\u064A\u062D \u064A\u0642\u062F\u0631 \u064A\u0634\u0641\u064A \u0623\u064A \u0648\u062C\u0639.",
      verse: "\u0623\u064E\u062D\u0652\u0632\u064E\u0627\u0646\u064E\u0646\u064E\u0627 \u062D\u064E\u0645\u064E\u0644\u064E\u0647\u064E\u0627\u060C \u0648\u064E\u0623\u064E\u0648\u0652\u062C\u064E\u0627\u0639\u064E\u0646\u064E\u0627 \u062A\u064E\u062D\u064E\u0645\u064E\u0651\u0644\u064E\u0647\u064E\u0627.. \u0648\u064E\u0628\u0650\u062C\u0650\u0631\u064E\u0627\u062D\u0650\u0647\u0650 \u0634\u064F\u0641\u0650\u064A\u0646\u064E\u0627.",
      reference: "\u0625\u0634\u0639\u064A\u0627\u0621 53: 4-5"
    },
    {
      headline: "\u062C\u0631\u0628.. \u0645\u0634 \u0647\u062A\u062E\u0633\u0631 \u062D\u0627\u062C\u0629.",
      verse: "\u062A\u0639\u0627\u0644 \u0648\u0633\u0644\u0645\u0647 \u0648\u062C\u0639\u0643 \u0648\u0634\u0648\u0641 \u0625\u064A\u062F\u0647 \u0647\u062A\u0639\u0645\u0644 \u0625\u064A\u0647 \u0641\u064A \u062D\u064A\u0627\u062A\u0643."
    }
  ],
  contact: arContact
};
var arForgiveness = {
  popupHeadline: "\u0643\u0644\u0646\u0627 \u0628\u0646\u063A\u0644\u0637.. \u0628\u0633 \u0631\u062D\u0645\u0629 \u0631\u0628\u0646\u0627 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u064A \u0630\u0646\u0628.",
  popupBody: "\u0643\u0644\u0646\u0627 \u0623\u062E\u0637\u0623\u0646\u0627 \u0648\u0628\u0639\u062F\u0646\u0627\u060C \u0644\u0643\u0646 \u0627\u0644\u0644\u0647 \u063A\u0641\u0631 \u062E\u0637\u0627\u064A\u0627\u0646\u0627 \u0643\u0644\u0647\u0627 \u0648\u0623\u062D\u0628\u0646\u0627.. \u0648\u0645\u0633\u062A\u0646\u064A\u0643 \u062A\u0631\u062C\u0639 \u0644\u0647 \u0648\u062A\u0628\u062F\u0623 \u0635\u0641\u062D\u0629 \u062C\u062F\u064A\u062F\u0629.",
  learnMoreButton: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064A\u062F",
  interestedButton: "\u0639\u0627\u0648\u0632 \u0623\u0628\u062F\u0623 \u0645\u0646 \u062C\u062F\u064A\u062F",
  notNowButton: "\u0645\u0634 \u062F\u0644\u0648\u0642\u062A\u064A",
  scenes: [
    {
      kicker: "\u062D\u0627\u0633\u0633 \u0625\u0646 \u0630\u0646\u0648\u0628\u0643 \u0645\u0643\u062A\u0651\u0641\u0627\u0643\u061F",
      headline: "\u0643\u0644\u0646\u0627 \u063A\u0644\u0637\u0646\u0627.. \u0628\u0633 \u0631\u062D\u0645\u062A\u0647 \u0623\u0643\u0628\u0631.",
      verse: "\u0625\u0650\u0646\u0652 \u0643\u064E\u0627\u0646\u064E\u062A\u0652 \u062E\u064E\u0637\u064E\u0627\u064A\u064E\u0627\u0643\u064F\u0645\u0652 \u0643\u064E\u0627\u0644\u0652\u0642\u0650\u0631\u0652\u0645\u0650\u0632\u0650 \u062A\u064E\u0628\u0652\u064A\u064E\u0636\u064F\u0651 \u0643\u064E\u0627\u0644\u062B\u064E\u0651\u0644\u0652\u062C\u0650.",
      reference: "\u0625\u0634\u0639\u064A\u0627\u0621 1: 18"
    },
    {
      headline: "\u0627\u0631\u062A\u0627\u062D \u0648\u0627\u0628\u062F\u0623 \u0645\u0646 \u062C\u062F\u064A\u062F.",
      verse: "\u0627\u0644\u0644\u0647 \u063A\u0641\u0631 \u0643\u0644 \u062E\u0637\u0627\u064A\u0627\u0646\u0627 \u0648\u0623\u062D\u0628\u0646\u0627.. \u062A\u0639\u0627\u0644\u0649 \u0648\u0627\u0628\u062F\u0623 \u062D\u064A\u0627\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0633\u0644\u0627\u0645."
    }
  ],
  contact: arContact
};
var arVariants = [arLove, arHealer, arForgiveness];
var ar = arLove;

// src/locales/en.ts
var enContact = {
  title: "We're here for you anytime.",
  intro: "Whether you have questions, need someone to talk to, or just want to learn more \u2014 we'd love to connect. Pick whatever app you're most comfortable with; no pressure, at your own pace.",
  whatsappHint: "Quick & direct chat",
  telegramHint: "Simple & private",
  messengerHint: "Chat on Facebook",
  emailPrompt: "Prefer a thoughtful email?",
  emailAction: "Drop us a note",
  prefilledMessage: "I want to know more about what you are talking about!"
};
var enLove = {
  popupHeadline: "Someone loves you truly \u2014 no strings attached.",
  popupBody: "You don't have to prove anything or earn it. You are loved just as you are. Take one minute to discover it.",
  learnMoreButton: "Learn More",
  interestedButton: "I'd Like to Hear More",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "Love with no strings attached\u2026",
      headline: "Christ loves you just as you are.",
      verse: "I have loved you with an everlasting love; therefore with lovingkindness I have drawn you.",
      reference: "Jeremiah 31:3"
    },
    {
      headline: "Come to Him just as you are.",
      verse: "He isn't waiting for you to fix yourself first. Open your heart to His love."
    }
  ],
  contact: enContact
};
var enHealer = {
  popupHeadline: "Hurting or struggling? There is healing for you.",
  popupBody: "Christ can heal any disease, pain, or weakness. Even if you don't believe it, just come and see \u2014 you have nothing to lose.",
  learnMoreButton: "Learn More",
  interestedButton: "I Need This Healing",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "When pain wears you down\u2026",
      headline: "Christ has the power to heal.",
      verse: "Surely He took up our pain and bore our suffering\u2026 and by His wounds we are healed.",
      reference: "Isaiah 53:4-5"
    },
    {
      headline: "Come and see \u2014 you have nothing to lose.",
      verse: "Place your pain in His hands today and experience His healing touch."
    }
  ],
  contact: enContact
};
var enForgiveness = {
  popupHeadline: "We all fall short, but God's mercy is greater.",
  popupBody: "No matter what you've done, God forgave all our sins and loved us. He's waiting to start a fresh page with you.",
  learnMoreButton: "Learn More",
  interestedButton: "I Want a Fresh Start",
  notNowButton: "Not Right Now",
  scenes: [
    {
      kicker: "Weighed down by mistakes?",
      headline: "Mercy is greater than guilt.",
      verse: "Though your sins are like scarlet, they shall be as white as snow.",
      reference: "Isaiah 1:18"
    },
    {
      headline: "Be free from the burden of the past.",
      verse: "He forgave all our sins and loved us. Come and start anew with peace and joy."
    }
  ],
  contact: enContact
};
var enVariants = [enLove, enHealer, enForgiveness];
var en = enLove;

// src/locales/es.ts
var es = {
  popupHeadline: "Alguien te am\xF3 hasta la muerte.",
  popupBody: "Hay algo en tu coraz\xF3n que vale la pena escuchar. Solo toma un minuto.",
  learnMoreButton: "Saber M\xE1s",
  interestedButton: "Quiero Saber M\xE1s",
  notNowButton: "Ahora No",
  scenes: [
    {
      kicker: "Pero Dios no nos dej\xF3 en la oscuridad\u2026",
      headline: "La respuesta es Cristo.",
      verse: "Yo soy el camino, la verdad y la vida.",
      reference: "Juan 14:6"
    },
    {
      headline: "Abre tu coraz\xF3n a \xC9l hoy.",
      verse: "Ven a \xC9l \u2014 y encontrar\xE1s paz."
    }
  ],
  contact: {
    title: "Aqu\xED estamos para ti.",
    intro: "Si tienes dudas, necesitas desahogarte o quieres conocer m\xE1s, nos encantar\xEDa charlar. Elige la app que prefieras \u2014 con total confianza y a tu ritmo.",
    whatsappHint: "Charla r\xE1pida y directa",
    telegramHint: "Sencillo y privado",
    messengerHint: "Por Facebook Messenger",
    emailPrompt: "\xBFPrefieres escribir un correo?",
    emailAction: "Escr\xEDbenos cuando quieras",
    prefilledMessage: "\xA1Quiero saber m\xE1s sobre lo que est\xE1s hablando!"
  }
};

// src/locales/fr.ts
var fr = {
  popupHeadline: "Quelqu'un t'a aim\xE9 jusqu'\xE0 la mort.",
  popupBody: "Il y a quelque chose dans ton c\u0153ur qui m\xE9rite d'\xEAtre entendu. Cela ne prend qu'une minute.",
  learnMoreButton: "En Savoir Plus",
  interestedButton: "Je Veux en Savoir Plus",
  notNowButton: "Pas Maintenant",
  scenes: [
    {
      kicker: "Mais Dieu ne nous a pas laiss\xE9s dans l'obscurit\xE9\u2026",
      headline: "La r\xE9ponse, c'est Christ.",
      verse: "Je suis le chemin, la v\xE9rit\xE9 et la vie.",
      reference: "Jean 14:6"
    },
    {
      headline: "Ouvre-lui ton c\u0153ur aujourd'hui.",
      verse: "Viens \xE0 lui \u2014 et tu trouveras la paix."
    }
  ],
  contact: {
    title: "On est l\xE0 pour toi, \xE0 tout moment.",
    intro: "Que tu aies des questions, besoin de parler ou envie d'en savoir plus, on sera ravis d'\xE9changer avec toi. Choisis l'appli o\xF9 tu es le plus \xE0 l'aise, en toute simplicit\xE9 et \xE0 ton rythme.",
    whatsappHint: "Discussion rapide et directe",
    telegramHint: "Simple et confidentiel",
    messengerHint: "Par Facebook Messenger",
    emailPrompt: "Tu pr\xE9f\xE8res par e-mail ?",
    emailAction: "\xC9cris-nous un mot",
    prefilledMessage: "Je veux en savoir plus sur ce dont vous parlez !"
  }
};

// src/locales/pt.ts
var pt = {
  popupHeadline: "Algu\xE9m te amou at\xE9 a morte.",
  popupBody: "H\xE1 algo em seu cora\xE7\xE3o que vale a pena ouvir. Leva s\xF3 um minuto.",
  learnMoreButton: "Saiba Mais",
  interestedButton: "Quero Saber Mais",
  notNowButton: "Agora N\xE3o",
  scenes: [
    {
      kicker: "Mas Deus n\xE3o nos deixou na escurid\xE3o\u2026",
      headline: "A resposta \xE9 Cristo.",
      verse: "Eu sou o caminho, a verdade e a vida.",
      reference: "Jo\xE3o 14:6"
    },
    {
      headline: "Abra seu cora\xE7\xE3o para Ele hoje.",
      verse: "Venha a Ele \u2014 e voc\xEA encontrar\xE1 paz."
    }
  ],
  contact: {
    title: "Estamos aqui para voc\xEA.",
    intro: "Quer conversar, tirar d\xFAvidas ou simplesmente saber mais? Vamos adorar bater um papo. Escolha o app mais confort\xE1vel para voc\xEA, sem pressa e no seu tempo.",
    whatsappHint: "Conversa r\xE1pida e direta",
    telegramHint: "Simples e privativo",
    messengerHint: "Pelo Facebook Messenger",
    emailPrompt: "Prefere um e-mail com calma?",
    emailAction: "Mande uma mensagem",
    prefilledMessage: "Quero saber mais sobre o que voc\xEA est\xE1 falando!"
  }
};

// src/locales/hi.ts
var hi = {
  popupHeadline: "\u0915\u093F\u0938\u0940 \u0928\u0947 \u0924\u0941\u092E\u0938\u0947 \u092E\u0930\u0924\u0947 \u0926\u092E \u0924\u0915 \u092A\u094D\u092F\u093E\u0930 \u0915\u093F\u092F\u093E\u0964",
  popupBody: "\u0924\u0941\u092E\u094D\u0939\u093E\u0930\u0947 \u0926\u093F\u0932 \u092E\u0947\u0902 \u0915\u0941\u091B \u0910\u0938\u093E \u0939\u0948 \u091C\u094B \u0938\u0941\u0928\u0928\u0947 \u0932\u093E\u092F\u0915 \u0939\u0948\u0964 \u092C\u0938 \u090F\u0915 \u092E\u093F\u0928\u091F \u0932\u0917\u0947\u0917\u093E\u0964",
  learnMoreButton: "\u0914\u0930 \u091C\u093E\u0928\u0947\u0902",
  interestedButton: "\u092E\u0941\u091D\u0947 \u0914\u0930 \u091C\u093E\u0928\u0928\u093E \u0939\u0948",
  notNowButton: "\u0905\u092D\u0940 \u0928\u0939\u0940\u0902",
  scenes: [
    {
      kicker: "\u092A\u0930 \u092A\u0930\u092E\u0947\u0936\u094D\u0935\u0930 \u0928\u0947 \u0939\u092E\u0947\u0902 \u0905\u0902\u0927\u0947\u0930\u0947 \u092E\u0947\u0902 \u0928\u0939\u0940\u0902 \u091B\u094B\u0921\u093C\u093E\u2026",
      headline: "\u0909\u0924\u094D\u0924\u0930 \u092E\u0938\u0940\u0939 \u0939\u0948\u0964",
      verse: "\u092E\u093E\u0930\u094D\u0917, \u0938\u0924\u094D\u092F \u0914\u0930 \u091C\u0940\u0935\u0928 \u092E\u0948\u0902 \u0939\u0940 \u0939\u0942\u0901\u0964",
      reference: "\u092F\u0942\u0939\u0928\u094D\u0928\u093E \u0967\u096A:\u096C"
    },
    {
      headline: "\u0906\u091C \u0909\u0938\u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u093E \u0926\u093F\u0932 \u0916\u094B\u0932\u094B\u0964",
      verse: "\u0909\u0938\u0915\u0947 \u092A\u093E\u0938 \u0906\u0913 \u2014 \u0914\u0930 \u0924\u0941\u092E\u094D\u0939\u0947\u0902 \u0936\u093E\u0902\u0924\u093F \u092E\u093F\u0932\u0947\u0917\u0940\u0964"
    }
  ],
  contact: {
    title: "\u0939\u092E \u0939\u092E\u0947\u0936\u093E \u0906\u092A\u0915\u0947 \u0938\u093E\u0925 \u0939\u0948\u0902\u0964",
    intro: "\u091A\u093E\u0939\u0947 \u0906\u092A\u0915\u0947 \u092E\u0928 \u092E\u0947\u0902 \u0915\u094B\u0908 \u0938\u0935\u093E\u0932 \u0939\u094B, \u0926\u093F\u0932 \u0915\u0940 \u092C\u093E\u0924 \u0915\u0939\u0928\u0940 \u0939\u094B, \u092F\u093E \u092C\u0938 \u0914\u0930 \u091C\u093E\u0928\u0928\u093E \u0939\u094B \u2014 \u0939\u092E\u0947\u0902 \u0906\u092A\u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0915\u0947 \u092C\u0939\u0941\u0924 \u0916\u0941\u0936\u0940 \u0939\u094B\u0917\u0940\u0964 \u091C\u093F\u0938 \u0910\u092A \u092E\u0947\u0902 \u0906\u092A \u0938\u0939\u091C \u092E\u0939\u0938\u0942\u0938 \u0915\u0930\u0947\u0902 \u0909\u0938\u0947 \u091A\u0941\u0928\u0947\u0902, \u0905\u092A\u0928\u0940 \u0917\u0924\u093F \u0938\u0947 \u0914\u0930 \u092C\u093F\u0928\u093E \u0915\u093F\u0938\u0940 \u091D\u093F\u091D\u0915 \u0915\u0947\u0964",
    whatsappHint: "\u0938\u0940\u0927\u0940 \u0914\u0930 \u0924\u0941\u0930\u0902\u0924 \u092C\u093E\u0924\u091A\u0940\u0924",
    telegramHint: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0914\u0930 \u0928\u093F\u091C\u0940",
    messengerHint: "\u092B\u093C\u0947\u0938\u092C\u0941\u0915 \u092E\u0948\u0938\u0947\u0902\u091C\u0930 \u092A\u0930",
    emailPrompt: "\u0915\u094D\u092F\u093E \u0908\u092E\u0947\u0932 \u091C\u093C\u094D\u092F\u093E\u0926\u093E \u092A\u0938\u0902\u0926 \u0939\u0948?",
    emailAction: "\u0939\u092E\u0947\u0902 \u0915\u092D\u0940 \u092D\u0940 \u0932\u093F\u0916\u0947\u0902",
    prefilledMessage: "\u092E\u0948\u0902 \u0907\u0938\u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0914\u0930 \u0905\u0927\u093F\u0915 \u091C\u093E\u0928\u0928\u093E \u091A\u093E\u0939\u0924\u093E \u0939\u0942\u0901!"
  }
};

// src/locales/zh.ts
var zh = {
  popupHeadline: "\u6709\u4EBA\u7231\u4F60\u81F3\u6B7B\u4E0D\u6E1D\u3002",
  popupBody: "\u4F60\u5FC3\u91CC\u6709\u4E9B\u8BDD\u503C\u5F97\u88AB\u542C\u89C1,\u53EA\u9700\u8981\u4E00\u5206\u949F\u3002",
  learnMoreButton: "\u4E86\u89E3\u66F4\u591A",
  interestedButton: "\u6211\u60F3\u4E86\u89E3\u66F4\u591A",
  notNowButton: "\u6682\u65F6\u4E0D\u9700\u8981",
  scenes: [
    {
      kicker: "\u4F46\u795E\u6CA1\u6709\u8BA9\u6211\u4EEC\u6D3B\u5728\u9ED1\u6697\u91CC\u2026",
      headline: "\u7B54\u6848\u5C31\u662F\u57FA\u7763\u3002",
      verse: "\u6211\u5C31\u662F\u9053\u8DEF\u3001\u771F\u7406\u3001\u751F\u547D\u3002",
      reference: "\u7EA6\u7FF0\u798F\u97F3 14:6"
    },
    {
      headline: "\u4ECA\u5929\u5411\u7942\u655E\u5F00\u4F60\u7684\u5FC3\u3002",
      verse: "\u6765\u5230\u7942\u9762\u524D\u2014\u2014\u4F60\u4F1A\u627E\u5230\u5E73\u5B89\u3002"
    }
  ],
  contact: {
    title: "\u6211\u4EEC\u968F\u65F6\u90FD\u5728\u8FD9\u91CC\u966A\u4F60\u3002",
    intro: "\u65E0\u8BBA\u4F60\u5FC3\u91CC\u6709\u4EC0\u4E48\u7591\u95EE\u3001\u60F3\u503E\u8BC9\uFF0C\u8FD8\u662F\u60F3\u4E86\u89E3\u66F4\u591A\uFF0C\u6211\u4EEC\u90FD\u5F88\u4E50\u610F\u4E0E\u4F60\u804A\u804A\u3002\u9009\u4E00\u4E2A\u4F60\u6700\u81EA\u5728\u7684\u5E94\u7528\uFF0C\u4E0D\u7528\u6709\u4EFB\u4F55\u538B\u529B\uFF0C\u6309\u4F60\u81EA\u5DF1\u7684\u8282\u594F\u6765\u3002",
    whatsappHint: "\u5FEB\u901F\u76F4\u63A5\u804A\u5929",
    telegramHint: "\u8F7B\u4FBF\u79C1\u5BC6",
    messengerHint: "\u5728 Facebook \u7545\u804A",
    emailPrompt: "\u66F4\u4E60\u60EF\u53D1\u90AE\u4EF6\uFF1F",
    emailAction: "\u968F\u65F6\u5199\u4FE1\u7ED9\u6211\u4EEC",
    prefilledMessage: "\u6211\u60F3\u4E86\u89E3\u66F4\u591A\u4F60\u6240\u8BF4\u7684\u4E8B\u60C5\uFF01"
  }
};

// src/locales/ru.ts
var ru = {
  popupHeadline: "\u041A\u0442\u043E-\u0442\u043E \u043B\u044E\u0431\u0438\u043B \u0442\u0435\u0431\u044F \u0434\u043E \u0441\u0430\u043C\u043E\u0439 \u0441\u043C\u0435\u0440\u0442\u0438.",
  popupBody: "\u0412 \u0442\u0432\u043E\u0451\u043C \u0441\u0435\u0440\u0434\u0446\u0435 \u0435\u0441\u0442\u044C \u0442\u043E, \u0447\u0442\u043E \u0441\u0442\u043E\u0438\u0442 \u0443\u0441\u043B\u044B\u0448\u0430\u0442\u044C. \u042D\u0442\u043E \u0437\u0430\u0439\u043C\u0451\u0442 \u0432\u0441\u0435\u0433\u043E \u043C\u0438\u043D\u0443\u0442\u0443.",
  learnMoreButton: "\u0423\u0437\u043D\u0430\u0442\u044C \u0411\u043E\u043B\u044C\u0448\u0435",
  interestedButton: "\u0425\u043E\u0447\u0443 \u0423\u0437\u043D\u0430\u0442\u044C \u0411\u043E\u043B\u044C\u0448\u0435",
  notNowButton: "\u041D\u0435 \u0421\u0435\u0439\u0447\u0430\u0441",
  scenes: [
    {
      kicker: "\u041D\u043E \u0411\u043E\u0433 \u043D\u0435 \u043E\u0441\u0442\u0430\u0432\u0438\u043B \u043D\u0430\u0441 \u0432\u043E \u0442\u044C\u043C\u0435\u2026",
      headline: "\u041E\u0442\u0432\u0435\u0442 \u2014 \u0425\u0440\u0438\u0441\u0442\u043E\u0441.",
      verse: "\u042F \u0435\u0441\u043C\u044C \u043F\u0443\u0442\u044C \u0438 \u0438\u0441\u0442\u0438\u043D\u0430 \u0438 \u0436\u0438\u0437\u043D\u044C.",
      reference: "\u0418\u043E\u0430\u043D\u043D\u0430 14:6"
    },
    {
      headline: "\u041E\u0442\u043A\u0440\u043E\u0439 \u0415\u043C\u0443 \u0441\u0432\u043E\u0451 \u0441\u0435\u0440\u0434\u0446\u0435 \u0441\u0435\u0433\u043E\u0434\u043D\u044F.",
      verse: "\u041F\u0440\u0438\u0434\u0438 \u043A \u041D\u0435\u043C\u0443 \u2014 \u0438 \u043E\u0431\u0440\u0435\u0442\u0451\u0448\u044C \u043F\u043E\u043A\u043E\u0439."
    }
  ],
  contact: {
    title: "\u041C\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u0440\u044F\u0434\u043E\u043C, \u043A\u043E\u0433\u0434\u0430 \u0442\u0435\u0431\u0435 \u043D\u0443\u0436\u043D\u043E.",
    intro: "\u0415\u0441\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u0432\u044B\u0433\u043E\u0432\u043E\u0440\u0438\u0442\u044C\u0441\u044F \u0438\u043B\u0438 \u043F\u0440\u043E\u0441\u0442\u043E \u0443\u0437\u043D\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435? \u041C\u044B \u0431\u0443\u0434\u0435\u043C \u0438\u0441\u043A\u0440\u0435\u043D\u043D\u0435 \u0440\u0430\u0434\u044B \u043F\u043E\u043E\u0431\u0449\u0430\u0442\u044C\u0441\u044F. \u0412\u044B\u0431\u0438\u0440\u0430\u0439 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u043C \u0442\u0435\u0431\u0435 \u0443\u0434\u043E\u0431\u043D\u0435\u0435 \u2014 \u0432 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u043C \u0442\u0435\u043C\u043F\u0435 \u0438 \u0431\u0435\u0437 \u0432\u0441\u044F\u043A\u043E\u0433\u043E \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F.",
    whatsappHint: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0436\u0438\u0432\u043E\u0439 \u0434\u0438\u0430\u043B\u043E\u0433",
    telegramHint: "\u041F\u0440\u043E\u0441\u0442\u043E \u0438 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E",
    messengerHint: "\u0412 Facebook Messenger",
    emailPrompt: "\u0423\u0434\u043E\u0431\u043D\u0435\u0435 \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043F\u0438\u0441\u044C\u043C\u043E?",
    emailAction: "\u041D\u0430\u043F\u0438\u0448\u0438 \u043D\u0430\u043C \u0432 \u043B\u044E\u0431\u043E\u0435 \u0432\u0440\u0435\u043C\u044F",
    prefilledMessage: "\u042F \u0445\u043E\u0447\u0443 \u0443\u0437\u043D\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043E \u0442\u043E\u043C, \u043E \u0447\u0435\u043C \u0432\u044B \u0433\u043E\u0432\u043E\u0440\u0438\u0442\u0435!"
  }
};

// src/locales/id.ts
var id = {
  popupHeadline: "Ada yang mengasihimu sampai mati.",
  popupBody: "Ada sesuatu di hatimu yang layak untuk didengar. Hanya perlu satu menit.",
  learnMoreButton: "Pelajari Lebih Lanjut",
  interestedButton: "Saya Ingin Tahu Lebih Lanjut",
  notNowButton: "Belum Sekarang",
  scenes: [
    {
      kicker: "Tapi Allah tidak membiarkan kita dalam gelap\u2026",
      headline: "Jawabannya adalah Kristus.",
      verse: "Akulah jalan, kebenaran, dan hidup.",
      reference: "Yohanes 14:6"
    },
    {
      headline: "Bukalah hatimu bagi-Nya hari ini.",
      verse: "Datanglah kepada-Nya \u2014 dan kau akan menemukan damai."
    }
  ],
  contact: {
    title: "Kami selalu ada untukmu.",
    intro: "Punya pertanyaan, butuh teman cerita, atau ingin tahu lebih banyak? Kami sangat senang bisa ngobrol denganmu. Pilih aplikasi yang paling nyaman untukmu \u2014 santai saja, sesuai waktumu.",
    whatsappHint: "Chat cepat & langsung",
    telegramHint: "Simpel & privat",
    messengerHint: "Lewat Facebook Messenger",
    emailPrompt: "Lebih nyaman lewat email?",
    emailAction: "Kirim pesan kapan saja",
    prefilledMessage: "Saya ingin tahu lebih banyak tentang apa yang Anda bicarakan!"
  }
};

// src/locales/sw.ts
var sw = {
  popupHeadline: "Kuna aliyekupenda hadi kufa.",
  popupBody: "Kuna jambo moyoni mwako linalostahili kusikilizwa. Inachukua dakika moja tu.",
  learnMoreButton: "Jifunze Zaidi",
  interestedButton: "Nataka Kujua Zaidi",
  notNowButton: "Si Sasa",
  scenes: [
    {
      kicker: "Lakini Mungu hakutuacha gizani\u2026",
      headline: "Jibu ni Kristo.",
      verse: "Mimi ndimi njia, na kweli, na uzima.",
      reference: "Yohana 14:6"
    },
    {
      headline: "Fungua moyo wako kwake leo.",
      verse: "Njoo kwake \u2014 nawe utapata amani."
    }
  ],
  contact: {
    title: "Tuko hapa kwa ajili yako daima.",
    intro: "Iwe una maswali, unahitaji mtu wa kuongea naye, au unataka tu kujua zaidi \u2014 tutafurahi sana kuungana nawe. Chagua programu unayopenda zaidi, bila shinikizo na kwa nafasi yako.",
    whatsappHint: "Mazungumzo ya haraka & moja kwa moja",
    telegramHint: "Rahisi & ya faragha",
    messengerHint: "Kupitia Facebook Messenger",
    emailPrompt: "Unapendelea barua pepe tulivu?",
    emailAction: "Tuandikie wakati wowote",
    prefilledMessage: "Nataka kujua zaidi kuhusu kile unachozungumza!"
  }
};

// src/locales/index.ts
var all = { ar, en, es, fr, pt, hi, zh, ru, id, sw };
var allVariants = {
  ar: arVariants,
  en: enVariants,
  es: [es],
  fr: [fr],
  pt: [pt],
  hi: [hi],
  zh: [zh],
  ru: [ru],
  id: [id],
  sw: [sw]
};
var rtlLanguageCodes = /* @__PURE__ */ new Set(["ar"]);
function isRtl(languageCode) {
  return rtlLanguageCodes.has(languageCode);
}
function resolve(languageCode, variantIndex, random = Math.random) {
  const code = languageCode in allVariants ? languageCode : "en";
  const variants = allVariants[code] ?? enVariants;
  if (variantIndex !== void 0) {
    const idx2 = (variantIndex % variants.length + variants.length) % variants.length;
    return variants[idx2];
  }
  const idx = Math.floor(random() * variants.length);
  return variants[idx];
}
function resolveLanguageCode(languageCode) {
  return languageCode in all ? languageCode : "en";
}

// src/components/TeaserPopup.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";

// src/colors.ts
var colors = {
  ink: "#2C2013",
  soft: "#6F5E47",
  gold: "#B23A2E",
  teaserBg: "#F7F0E2",
  buttonText: "#FFF8EA",
  gradientTop: "#F7F0E2",
  gradientBottom: "#EEE1CB"
};

// src/components/TeaserPopup.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function TeaserPopup({
  strings,
  isRtl: isRtl2,
  onLearnMore,
  onClose
}) {
  const textDir = isRtl2 ? "rtl" : "ltr";
  return /* @__PURE__ */ jsxs(View, { style: styles.backdrop, children: [
    onClose && /* @__PURE__ */ jsx(Pressable, { style: StyleSheet.absoluteFill, onPress: onClose }),
    /* @__PURE__ */ jsxs(View, { style: styles.card, children: [
      onClose && /* @__PURE__ */ jsx(
        Pressable,
        {
          accessibilityRole: "button",
          accessibilityLabel: "Close",
          onPress: onClose,
          hitSlop: 12,
          style: [styles.closeButton, isRtl2 ? styles.closeLeft : styles.closeRight],
          children: /* @__PURE__ */ jsx(Text, { style: styles.closeIcon, children: "\u2715" })
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: [styles.headline, { writingDirection: textDir }], children: strings.popupHeadline }),
      /* @__PURE__ */ jsx(Text, { style: [styles.body, { writingDirection: textDir }], children: strings.popupBody }),
      /* @__PURE__ */ jsx(Pressable, { style: styles.button, onPress: onLearnMore, children: /* @__PURE__ */ jsx(Text, { style: styles.buttonText, children: strings.learnMoreButton }) }),
      onClose && /* @__PURE__ */ jsx(
        Pressable,
        {
          accessibilityRole: "button",
          accessibilityLabel: strings.notNowButton,
          onPress: onClose,
          style: ({ pressed }) => [styles.notNowButton, pressed && styles.notNowPressed],
          children: /* @__PURE__ */ jsx(Text, { style: styles.notNowText, children: strings.notNowButton })
        }
      )
    ] })
  ] });
}
var styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  card: { width: "100%", backgroundColor: colors.teaserBg, borderRadius: 24, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 20, position: "relative" },
  closeButton: {
    position: "absolute",
    top: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFCF5",
    borderWidth: 1,
    borderColor: "rgba(111,94,71,0.18)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  closeRight: { right: 14 },
  closeLeft: { left: 14 },
  closeIcon: { fontSize: 14, color: colors.soft, fontWeight: "600", lineHeight: 16 },
  headline: { fontSize: 22, fontWeight: "700", color: colors.ink, textAlign: "center", lineHeight: 30 },
  body: { fontSize: 15, color: colors.soft, textAlign: "center", marginTop: 14, lineHeight: 22 },
  button: { marginTop: 28, backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: colors.buttonText, fontSize: 16, fontWeight: "700" },
  notNowButton: { marginTop: 8, paddingVertical: 10, alignItems: "center" },
  notNowPressed: { opacity: 0.6 },
  notNowText: { fontSize: 15, fontWeight: "600", color: colors.soft }
});

// src/components/SalvationFlow.tsx
import { useEffect as useEffect5, useState as useState2 } from "react";
import { View as View9, Text as Text4, StyleSheet as StyleSheet8 } from "react-native";
import { useSharedValue as useSharedValue4, withTiming as withTiming4, Easing as Easing5 } from "react-native-reanimated";

// src/components/SceneFrame.tsx
import { View as View3, StyleSheet as StyleSheet3 } from "react-native";
import Svg2, { Defs as Defs2, LinearGradient, Stop as Stop2, Rect } from "react-native-svg";

// src/components/SunGlow.tsx
import { useEffect } from "react";
import { View as View2 } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function SunGlow({ opacity = 0.6, size = 380 }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 6e3, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [t]);
  const style = useAnimatedStyle(
    () => ({
      transform: [{ scale: 0.94 + t.value * 0.12 }]
    }),
    [t]
  );
  return /* @__PURE__ */ jsx2(Animated.View, { style: [{ width: size, height: size }, style], pointerEvents: "none", children: /* @__PURE__ */ jsxs2(Svg, { width: size, height: size, children: [
    /* @__PURE__ */ jsx2(Defs, { children: /* @__PURE__ */ jsxs2(RadialGradient, { id: "glow", cx: "50%", cy: "50%", r: "50%", children: [
      /* @__PURE__ */ jsx2(Stop, { offset: "0", stopColor: "#FFD6B4", stopOpacity: opacity }),
      /* @__PURE__ */ jsx2(Stop, { offset: "0.42", stopColor: "#D25F42", stopOpacity: opacity * 0.4 }),
      /* @__PURE__ */ jsx2(Stop, { offset: "0.7", stopColor: "#D25F42", stopOpacity: 0 })
    ] }) }),
    /* @__PURE__ */ jsx2(Circle, { cx: size / 2, cy: size / 2, r: size / 2, fill: "url(#glow)" })
  ] }) });
}
function GlowingIllustration({
  glowOpacity = 0.6,
  glowSize = 380,
  illustrationSize = 120,
  children
}) {
  if (glowOpacity <= 0) return /* @__PURE__ */ jsx2(Fragment, { children });
  const offset = (illustrationSize - glowSize) / 2;
  return /* @__PURE__ */ jsxs2(
    View2,
    {
      style: {
        width: illustrationSize,
        height: illustrationSize,
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      },
      children: [
        /* @__PURE__ */ jsx2(
          View2,
          {
            pointerEvents: "none",
            style: {
              position: "absolute",
              top: offset,
              left: offset,
              width: glowSize,
              height: glowSize,
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ jsx2(SunGlow, { opacity: glowOpacity, size: glowSize })
          }
        ),
        children
      ]
    }
  );
}

// src/components/SceneFrame.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function SceneFrame({
  sunOpacity = 0,
  ambient,
  children
}) {
  return /* @__PURE__ */ jsxs3(View3, { style: StyleSheet3.absoluteFill, children: [
    /* @__PURE__ */ jsxs3(Svg2, { style: StyleSheet3.absoluteFill, width: "100%", height: "100%", children: [
      /* @__PURE__ */ jsx3(Defs2, { children: /* @__PURE__ */ jsxs3(LinearGradient, { id: "bg", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx3(Stop2, { offset: "0", stopColor: colors.gradientTop }),
        /* @__PURE__ */ jsx3(Stop2, { offset: "1", stopColor: colors.gradientBottom })
      ] }) }),
      /* @__PURE__ */ jsx3(Rect, { x: "0", y: "0", width: "100%", height: "100%", fill: "url(#bg)" })
    ] }),
    ambient && /* @__PURE__ */ jsx3(View3, { style: StyleSheet3.absoluteFill, children: ambient }),
    sunOpacity > 0 && /* @__PURE__ */ jsx3(View3, { style: styles2.sunWrap, pointerEvents: "none", children: /* @__PURE__ */ jsx3(SunGlow, { opacity: sunOpacity }) }),
    /* @__PURE__ */ jsx3(View3, { style: styles2.content, children })
  ] });
}
var styles2 = StyleSheet3.create({
  sunWrap: { position: "absolute", top: 40, left: 0, right: 0, alignItems: "center" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, paddingVertical: 96 }
});

// src/components/FadeSlideText.tsx
import Animated2, { useAnimatedStyle as useAnimatedStyle2 } from "react-native-reanimated";
import { jsx as jsx4 } from "react/jsx-runtime";
function FadeSlideText({
  growth,
  slideFrom = 24,
  style,
  children
}) {
  const animStyle = useAnimatedStyle2(
    () => ({
      opacity: growth.value,
      transform: [{ translateY: (1 - growth.value) * slideFrom }]
    }),
    [growth, slideFrom]
  );
  return /* @__PURE__ */ jsx4(Animated2.View, { style: [style, animStyle], children });
}

// src/components/Fade.tsx
import Animated3, { useAnimatedStyle as useAnimatedStyle3 } from "react-native-reanimated";
import { jsx as jsx5 } from "react/jsx-runtime";
function Fade({ growth, children }) {
  const style = useAnimatedStyle3(() => ({ opacity: growth.value }), [growth]);
  return /* @__PURE__ */ jsx5(Animated3.View, { style, children });
}

// src/components/ResponseButtons.tsx
import { useState } from "react";
import { Pressable as Pressable2, Text as Text2, StyleSheet as StyleSheet4 } from "react-native";
import Animated4, { useAnimatedStyle as useAnimatedStyle4, useAnimatedReaction, runOnJS } from "react-native-reanimated";
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function ResponseButtons({
  reveal,
  interestedLabel,
  notNowLabel,
  onInterested,
  onNotNow
}) {
  const [ready, setReady] = useState(false);
  useAnimatedReaction(
    () => reveal.value > 0.05,
    (isReady, prevReady) => {
      if (isReady !== prevReady) runOnJS(setReady)(isReady);
    },
    [reveal]
  );
  const style = useAnimatedStyle4(
    () => ({
      opacity: reveal.value,
      transform: [{ translateY: (1 - reveal.value) * 16 }]
    }),
    [reveal]
  );
  return /* @__PURE__ */ jsxs4(Animated4.View, { style: [styles3.wrap, style], children: [
    /* @__PURE__ */ jsx6(
      Pressable2,
      {
        disabled: !ready,
        onPress: onInterested,
        style: ({ pressed }) => [styles3.primary, pressed && styles3.primaryPressed],
        children: /* @__PURE__ */ jsx6(Text2, { style: styles3.primaryText, children: interestedLabel })
      }
    ),
    /* @__PURE__ */ jsx6(
      Pressable2,
      {
        disabled: !ready,
        onPress: onNotNow,
        style: ({ pressed }) => [styles3.secondary, pressed && styles3.secondaryPressed],
        hitSlop: 8,
        children: /* @__PURE__ */ jsx6(Text2, { style: styles3.secondaryText, children: notNowLabel })
      }
    )
  ] });
}
var styles3 = StyleSheet4.create({
  wrap: { alignItems: "center" },
  primary: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 18,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  primaryPressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
  primaryText: { color: colors.buttonText, fontSize: 18, fontWeight: "700" },
  secondary: { marginTop: 14, paddingVertical: 8 },
  secondaryPressed: { opacity: 0.6 },
  secondaryText: { color: colors.soft, fontSize: 15, fontWeight: "500" }
});

// src/components/SceneDots.tsx
import { View as View4, StyleSheet as StyleSheet5 } from "react-native";
import { jsx as jsx7 } from "react/jsx-runtime";
function SceneDots({ count, current, isRtl: isRtl2 = false }) {
  return /* @__PURE__ */ jsx7(View4, { style: [styles4.row, isRtl2 && styles4.rowRtl], children: Array.from({ length: count }).map((_, i) => {
    const active = i === current;
    return /* @__PURE__ */ jsx7(
      View4,
      {
        style: [styles4.dot, { width: active ? 22 : 8, backgroundColor: active ? colors.gold : "rgba(111,94,71,0.28)" }]
      },
      i
    );
  }) });
}
var styles4 = StyleSheet5.create({
  row: { flexDirection: "row", justifyContent: "center" },
  rowRtl: { flexDirection: "row-reverse" },
  dot: { height: 8, borderRadius: 999, marginHorizontal: 5 }
});

// src/components/NextButton.tsx
import { Pressable as Pressable3, Text as Text3, StyleSheet as StyleSheet6 } from "react-native";
import { jsx as jsx8 } from "react/jsx-runtime";
function NextButton({ onPress }) {
  return /* @__PURE__ */ jsx8(
    Pressable3,
    {
      onPress,
      style: ({ pressed }) => [styles5.button, pressed && styles5.buttonPressed],
      hitSlop: 8,
      children: /* @__PURE__ */ jsx8(Text3, { style: styles5.arrow, children: "\u2192" })
    }
  );
}
var styles5 = StyleSheet6.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  buttonPressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
  arrow: { color: colors.buttonText, fontSize: 24 }
});

// src/components/useBeat.ts
import { useDerivedValue, interpolate, Extrapolation, Easing as Easing2 } from "react-native-reanimated";
var BEAT_EASING = Easing2.out(Easing2.cubic);
function useBeat(progress, totalSeconds, startSeconds, durSeconds) {
  return useDerivedValue(() => {
    const s = startSeconds / totalSeconds;
    const e = (startSeconds + durSeconds) / totalSeconds;
    const t = interpolate(progress.value, [s, e], [0, 1], Extrapolation.CLAMP);
    return BEAT_EASING(t);
  }, [progress, totalSeconds, startSeconds, durSeconds]);
}

// src/analytics/AnalyticsProvider.tsx
import { createContext, useContext, useEffect as useEffect2, useMemo, useRef } from "react";

// src/analytics/types.ts
var noopAnalytics = {
  logEvent: () => {
  },
  setUserId: () => {
  },
  setProperty: () => {
  },
  screenView: () => {
  }
};

// src/analytics/sanitize.ts
var MAX_NAME_LENGTH = 40;
var MAX_VALUE_LENGTH = 100;
var MAX_PARAMS = 25;
var RESERVED_PREFIXES = ["firebase_", "google_", "ga_"];
var VALID = /^[a-z][a-z0-9_]*$/;
function coerce(raw, maxLength) {
  const folded = raw.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  const clipped = folded.slice(0, maxLength).replace(/_+$/g, "");
  return VALID.test(clipped) ? clipped : null;
}
function sanitizeEventName(name) {
  const clean = coerce(name, MAX_NAME_LENGTH);
  if (clean === null) return null;
  if (RESERVED_PREFIXES.some((p) => clean.startsWith(p))) return null;
  return clean;
}
function sanitizeValue(value) {
  if (value === void 0 || value === null) return null;
  if (typeof value === "number" && Number.isNaN(value)) return null;
  const text = String(value).trim();
  if (text === "") return null;
  return text.slice(0, MAX_VALUE_LENGTH);
}
function sanitizeParams(params) {
  if (!params) return {};
  const cleaned = {};
  for (const rawKey of Object.keys(params)) {
    const value = sanitizeValue(params[rawKey]);
    if (value === null) continue;
    const key = coerce(rawKey, MAX_NAME_LENGTH);
    if (key === null) continue;
    if (cleaned[key] === void 0) cleaned[key] = value;
  }
  const keys = Object.keys(cleaned).sort();
  if (keys.length <= MAX_PARAMS) return cleaned;
  const capped = {};
  for (const key of keys.slice(0, MAX_PARAMS)) capped[key] = cleaned[key];
  return capped;
}
function prefixEventName(prefix, name) {
  const cleanPrefix = coerce(prefix, MAX_NAME_LENGTH);
  if (cleanPrefix === null) return sanitizeEventName(name);
  return sanitizeEventName(`${cleanPrefix}_${name}`);
}
function sanitizeScreenName(screenName) {
  const text = String(screenName).trim();
  if (text === "") return null;
  return text.slice(0, MAX_VALUE_LENGTH);
}

// src/analytics/AnalyticsProvider.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var DEFAULT_EVENT_PREFIX = "followup";
var AnalyticsContext = createContext({
  analytics: noopAnalytics,
  eventPrefix: DEFAULT_EVENT_PREFIX
});
function PackageAnalyticsProvider({
  children,
  analytics = noopAnalytics,
  eventPrefix = DEFAULT_EVENT_PREFIX,
  onAnalyticsError
}) {
  const value = useMemo(
    () => ({ analytics, eventPrefix, onAnalyticsError }),
    [analytics, eventPrefix, onAnalyticsError]
  );
  return /* @__PURE__ */ jsx9(AnalyticsContext.Provider, { value, children });
}
function usePackageAnalytics() {
  const { analytics, eventPrefix, onAnalyticsError } = useContext(AnalyticsContext);
  const errorRef = useRef(onAnalyticsError);
  useEffect2(() => {
    errorRef.current = onAnalyticsError;
  }, [onAnalyticsError]);
  return useMemo(
    () => guard(analytics, eventPrefix, errorRef),
    [analytics, eventPrefix]
  );
}
function guard(impl, eventPrefix, errorRef) {
  const report = (error, method) => {
    try {
      errorRef.current?.(error, method);
    } catch {
    }
  };
  const isolate = (method, run) => {
    try {
      const result = run();
      if (result && typeof result.catch === "function") {
        result.catch((error) => report(error, method));
      }
    } catch (error) {
      report(error, method);
    }
  };
  return {
    logEvent: (name, params) => {
      const eventName = prefixEventName(eventPrefix, name);
      if (eventName === null) return;
      const clean = sanitizeParams(params);
      isolate("logEvent", () => impl.logEvent(eventName, clean));
    },
    setUserId: (id2) => isolate("setUserId", () => impl.setUserId(id2)),
    setProperty: (key, value) => {
      const clean = sanitizeParams({ [key]: value });
      const cleanKey = Object.keys(clean)[0];
      if (cleanKey === void 0) return;
      isolate("setProperty", () => impl.setProperty(cleanKey, clean[cleanKey]));
    },
    screenView: (screenName) => {
      const clean = sanitizeScreenName(screenName);
      if (clean === null) return;
      isolate("screenView", () => impl.screenView(clean));
    }
  };
}

// src/components/illustrations/BrokenWorldIllustration.tsx
import { View as View5 } from "react-native";
import Svg3, { Path } from "react-native-svg";
import Animated5, { useAnimatedProps } from "react-native-reanimated";
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
var AnimatedPath = Animated5.createAnimatedComponent(Path);
var JITTER = [0, -0.16, 0.1, -0.08, 0.14, 0];
function BrokenWorldIllustration({ growth, size = 108 }) {
  const center = size / 2;
  const radius = size / 2 - 4;
  const ringProps = useAnimatedProps(() => ({ strokeOpacity: 0.55 * growth.value }), [growth]);
  const crackProps = useAnimatedProps(() => {
    const g = growth.value;
    const n = JITTER.length;
    let d = "";
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const y = size * t;
      const x = center + JITTER[i] * radius * g;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    return { d, strokeOpacity: g };
  }, [growth, size, center, radius]);
  return /* @__PURE__ */ jsx10(View5, { style: { width: size, height: size }, children: /* @__PURE__ */ jsxs5(Svg3, { width: size, height: size, children: [
    /* @__PURE__ */ jsx10(
      AnimatedPath,
      {
        d: `M${center - radius},${center} A${radius},${radius} 0 1,0 ${center + radius},${center} A${radius},${radius} 0 1,0 ${center - radius},${center}`,
        stroke: colors.soft,
        strokeWidth: 3,
        fill: "none",
        animatedProps: ringProps
      }
    ),
    /* @__PURE__ */ jsx10(AnimatedPath, { stroke: colors.gold, strokeWidth: 3.5, strokeLinecap: "round", fill: "none", animatedProps: crackProps })
  ] }) });
}

// src/components/illustrations/FallingPetals.tsx
import { useEffect as useEffect3 } from "react";
import { View as View6, StyleSheet as StyleSheet7 } from "react-native";
import Animated6, { useSharedValue as useSharedValue2, useAnimatedStyle as useAnimatedStyle5, withRepeat as withRepeat2, withTiming as withTiming2, Easing as Easing3 } from "react-native-reanimated";
import { jsx as jsx11 } from "react/jsx-runtime";
var PETALS = [
  { xFraction: 0.12, phase: 0, size: 8, speed: 1 },
  { xFraction: 0.28, phase: 0.35, size: 5, speed: 1.3 },
  { xFraction: 0.5, phase: 0.6, size: 7, speed: 0.9 },
  { xFraction: 0.68, phase: 0.15, size: 6, speed: 1.1 },
  { xFraction: 0.85, phase: 0.5, size: 9, speed: 0.8 }
];
function Petal({ p }) {
  const t = useSharedValue2(0);
  useEffect3(() => {
    t.value = withRepeat2(withTiming2(1, { duration: 9e3 / p.speed, easing: Easing3.linear }), -1);
  }, [t, p.speed]);
  const style = useAnimatedStyle5(() => {
    const progress = (t.value + p.phase) % 1;
    return {
      left: `${p.xFraction * 100}%`,
      top: `${progress * 100}%`,
      opacity: Math.max(0, Math.sin(progress * Math.PI)) * 0.35,
      transform: [{ rotate: `${progress * 360}deg` }]
    };
  }, [t, p.phase, p.xFraction]);
  return /* @__PURE__ */ jsx11(Animated6.View, { style: [styles6.petal, style], children: /* @__PURE__ */ jsx11(View6, { style: { width: p.size, height: p.size * 1.4, borderRadius: p.size, backgroundColor: "#B23A2E" } }) });
}
function FallingPetals() {
  return /* @__PURE__ */ jsx11(View6, { style: StyleSheet7.absoluteFill, pointerEvents: "none", children: PETALS.map((p, i) => /* @__PURE__ */ jsx11(Petal, { p }, i)) });
}
var styles6 = StyleSheet7.create({ petal: { position: "absolute" } });

// src/components/illustrations/LightRays.tsx
import { useEffect as useEffect4 } from "react";
import Svg4, { Line } from "react-native-svg";
import Animated7, {
  useSharedValue as useSharedValue3,
  useAnimatedProps as useAnimatedProps2,
  useAnimatedStyle as useAnimatedStyle6,
  withRepeat as withRepeat3,
  withTiming as withTiming3,
  Easing as Easing4
} from "react-native-reanimated";
import { jsx as jsx12 } from "react/jsx-runtime";
var AnimatedLine = Animated7.createAnimatedComponent(Line);
var RAY_COUNT = 10;
function LightRays({ growth, size = 120 }) {
  const spin = useSharedValue3(0);
  useEffect4(() => {
    spin.value = withRepeat3(withTiming3(360, { duration: 24e3, easing: Easing4.linear }), -1);
  }, [spin]);
  const spinStyle = useAnimatedStyle6(() => ({ transform: [{ rotate: `${spin.value}deg` }] }), [spin]);
  const center = size / 2;
  const maxLen = size / 2;
  return /* @__PURE__ */ jsx12(Animated7.View, { style: [{ width: size, height: size }, spinStyle], children: /* @__PURE__ */ jsx12(Svg4, { width: size, height: size, children: Array.from({ length: RAY_COUNT }).map((_, i) => {
    const angle = i / RAY_COUNT * 2 * Math.PI;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const lenFactor = i % 2 === 0 ? 1 : 0.62;
    const animatedProps = useAnimatedProps2(() => {
      const g = growth.value;
      const len = maxLen * g * lenFactor;
      const startR = maxLen * 0.28;
      return {
        x1: center + dx * startR,
        y1: center + dy * startR,
        x2: center + dx * (startR + len),
        y2: center + dy * (startR + len),
        strokeOpacity: 0.5 * g
      };
    }, [growth, maxLen, lenFactor, dx, dy, center]);
    return /* @__PURE__ */ jsx12(AnimatedLine, { stroke: "#D0674A", strokeWidth: 2.5, strokeLinecap: "round", animatedProps }, i);
  }) }) });
}

// src/components/illustrations/AnimatedCross.tsx
import { View as View7 } from "react-native";
import Svg5, { Rect as Rect2, Defs as Defs3, LinearGradient as LinearGradient2, Stop as Stop3 } from "react-native-svg";
import Animated8, { useAnimatedProps as useAnimatedProps3 } from "react-native-reanimated";
import { jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
var AnimatedRect = Animated8.createAnimatedComponent(Rect2);
function AnimatedCross({ growth, height = 220 }) {
  const width = height * 0.62;
  const thickness = height * 0.11;
  const vProps = useAnimatedProps3(() => {
    const barHeight = height * growth.value;
    return { x: width / 2 - thickness / 2, y: height - barHeight, width: thickness, height: barHeight };
  }, [growth, height, width, thickness]);
  const hProps = useAnimatedProps3(() => {
    const barWidth = width * growth.value;
    return { x: width / 2 - barWidth / 2, y: height * 0.3 - thickness / 2, width: barWidth, height: thickness };
  }, [growth, height, width, thickness]);
  return /* @__PURE__ */ jsx13(View7, { style: { width, height }, children: /* @__PURE__ */ jsxs6(Svg5, { width, height, children: [
    /* @__PURE__ */ jsx13(Defs3, { children: /* @__PURE__ */ jsxs6(LinearGradient2, { id: "bar", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx13(Stop3, { offset: "0", stopColor: "#D0674A" }),
      /* @__PURE__ */ jsx13(Stop3, { offset: "1", stopColor: "#B23A2E" })
    ] }) }),
    /* @__PURE__ */ jsx13(AnimatedRect, { animatedProps: vProps, rx: thickness / 2, fill: "url(#bar)" }),
    /* @__PURE__ */ jsx13(AnimatedRect, { animatedProps: hProps, rx: thickness / 2, fill: "url(#bar)" })
  ] }) });
}

// src/components/illustrations/HeartOutline.tsx
import { View as View8 } from "react-native";
import Svg6, { Path as Path2 } from "react-native-svg";
import Animated9, { useAnimatedProps as useAnimatedProps4 } from "react-native-reanimated";
import { jsx as jsx14 } from "react/jsx-runtime";
var AnimatedPath2 = Animated9.createAnimatedComponent(Path2);
function HeartOutline({ growth, size = 120 }) {
  const w = size;
  const h = size;
  const d = `M${w * 0.5},${h * 0.92} C${w * -0.1},${h * 0.55} ${w * 0.08},${h * 0.05} ${w * 0.5},${h * 0.28} C${w * 0.92},${h * 0.05} ${w * 1.1},${h * 0.55} ${w * 0.5},${h * 0.92} Z`;
  const pathLength = size * 3.4;
  const animatedProps = useAnimatedProps4(
    () => ({
      strokeDashoffset: pathLength * (1 - growth.value)
    }),
    [growth, pathLength]
  );
  return /* @__PURE__ */ jsx14(View8, { style: { width: size, height: size }, children: /* @__PURE__ */ jsx14(Svg6, { width: size, height: size, children: /* @__PURE__ */ jsx14(
    AnimatedPath2,
    {
      d,
      stroke: "#B23A2E",
      strokeWidth: 4,
      strokeLinecap: "round",
      fill: "none",
      strokeDasharray: pathLength,
      animatedProps
    }
  ) }) });
}

// src/components/SalvationFlow.tsx
import { jsx as jsx15, jsxs as jsxs7 } from "react/jsx-runtime";
var SETTLE_SECONDS = [2.6, 2.2];
var BUTTON_DELAY_SECONDS = 2;
var BUTTON_FADE_SECONDS = 0.5;
function RefLine({ text, isRtl: isRtl2 }) {
  return /* @__PURE__ */ jsxs7(View9, { style: [styles7.refRow, isRtl2 && styles7.refRowRtl], children: [
    /* @__PURE__ */ jsx15(View9, { style: styles7.rule }),
    /* @__PURE__ */ jsx15(Text4, { style: styles7.refText, children: text }),
    /* @__PURE__ */ jsx15(View9, { style: styles7.rule })
  ] });
}
function SceneContent({
  sceneIndex,
  scene,
  isRtl: isRtl2,
  totalCount
}) {
  const settleIdx = Math.min(sceneIndex, SETTLE_SECONDS.length - 1);
  const totalSeconds = SETTLE_SECONDS[settleIdx] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue4(0);
  useEffect5(() => {
    progress.value = 0;
    progress.value = withTiming4(1, { duration: totalSeconds * 1e3, easing: Easing5.linear });
  }, []);
  const textDir = isRtl2 ? "rtl" : "ltr";
  const b = (start, dur) => useBeat(progress, totalSeconds, start, dur);
  if (totalCount === 2) {
    if (sceneIndex === 0) {
      return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
        /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.72, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0.1, 0.55), children: /* @__PURE__ */ jsx15(AnimatedCross, { growth: b(0.1, 0.55), height: 110 }) }) }),
        !!scene.kicker && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), style: styles7.gapSmall, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.kicker, { writingDirection: textDir }], children: scene.kicker }) }),
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.9, 0.75), style: styles7.gapSmall, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineMd, { writingDirection: textDir }], children: scene.headline }) }),
        !!scene.verse && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.8, 0.75), style: styles7.gapSmall, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.verse, { writingDirection: textDir }], children: scene.verse }) }),
        !!scene.reference && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(2.4, 0.7), style: styles7.gapSmall, children: /* @__PURE__ */ jsx15(RefLine, { text: scene.reference, isRtl: isRtl2 }) })
      ] });
    }
    return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
      /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.6, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0, 0.7), children: /* @__PURE__ */ jsx15(HeartOutline, { growth: b(0, 0.7), size: 120 }) }) }),
      /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), style: styles7.gapMd, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineLg, { writingDirection: textDir }], children: scene.headline }) }),
      !!scene.verse && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.1, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.verseGold, { writingDirection: textDir }], children: scene.verse }) })
    ] });
  }
  switch (sceneIndex) {
    case 0:
      return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
        /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.55, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0, 0.6), children: /* @__PURE__ */ jsx15(BrokenWorldIllustration, { growth: b(0, 0.6) }) }) }),
        !!scene.kicker && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.kicker, { writingDirection: textDir }], children: scene.kicker }) }),
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.9, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineLg, { writingDirection: textDir }], children: scene.headline }) })
      ] });
    case 1:
      return /* @__PURE__ */ jsxs7(SceneFrame, { ambient: /* @__PURE__ */ jsx15(FallingPetals, {}), children: [
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineMd, { writingDirection: textDir }], children: scene.headline }) }),
        !!scene.verse && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.1, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.verse, { writingDirection: textDir }], children: "\u201C" + scene.verse + "\u201D" }) }),
        !!scene.reference && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.9, 0.7), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(RefLine, { text: scene.reference, isRtl: isRtl2 }) })
      ] });
    case 2:
      return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
        /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.6, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0, 0.6), children: /* @__PURE__ */ jsx15(LightRays, { growth: b(0, 0.6) }) }) }),
        !!scene.kicker && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), style: styles7.gapSmall, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.kickerLg, { writingDirection: textDir }], children: scene.kicker }) }),
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.1, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineLg, styles7.gold, { writingDirection: textDir }], children: scene.headline }) })
      ] });
    case 3:
      return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
        /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.72, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0.1, 0.55), children: /* @__PURE__ */ jsx15(AnimatedCross, { growth: b(0.1, 0.55) }) }) }),
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.2, 0.75), style: styles7.gapMd, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineMd, { writingDirection: textDir }], children: scene.headline }) }),
        !!scene.verse && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(2, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.verse, { writingDirection: textDir }], children: "\u201C" + scene.verse + "\u201D" }) }),
        !!scene.reference && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(2.8, 0.7), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(RefLine, { text: scene.reference, isRtl: isRtl2 }) })
      ] });
    default:
      return /* @__PURE__ */ jsxs7(SceneFrame, { children: [
        /* @__PURE__ */ jsx15(GlowingIllustration, { glowOpacity: 0.6, children: /* @__PURE__ */ jsx15(Fade, { growth: b(0, 0.7), children: /* @__PURE__ */ jsx15(HeartOutline, { growth: b(0, 0.7), size: 120 }) }) }),
        /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(0.2, 0.75), style: styles7.gapMd, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.headlineLg, { writingDirection: textDir }], children: scene.headline }) }),
        !!scene.verse && /* @__PURE__ */ jsx15(FadeSlideText, { growth: b(1.1, 0.75), style: styles7.gapTop, children: /* @__PURE__ */ jsx15(Text4, { style: [styles7.verseGold, { writingDirection: textDir }], children: scene.verse }) })
      ] });
  }
}
function RevealNext({ sceneIndex, onAdvance }) {
  const settleIdx = Math.min(sceneIndex, SETTLE_SECONDS.length - 1);
  const totalSeconds = SETTLE_SECONDS[settleIdx] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue4(0);
  useEffect5(() => {
    progress.value = 0;
    progress.value = withTiming4(1, { duration: totalSeconds * 1e3, easing: Easing5.linear });
  }, []);
  const start = SETTLE_SECONDS[settleIdx] + BUTTON_DELAY_SECONDS;
  const reveal = useBeat(progress, totalSeconds, start, totalSeconds - start);
  return /* @__PURE__ */ jsx15(FadeSlideText, { growth: reveal, children: /* @__PURE__ */ jsx15(NextButton, { onPress: onAdvance }) });
}
function RevealResponse({
  sceneIndex,
  strings,
  onInterested,
  onNotNow
}) {
  const settleIdx = Math.min(sceneIndex, SETTLE_SECONDS.length - 1);
  const totalSeconds = SETTLE_SECONDS[settleIdx] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue4(0);
  useEffect5(() => {
    progress.value = 0;
    progress.value = withTiming4(1, { duration: totalSeconds * 1e3, easing: Easing5.linear });
  }, []);
  const start = SETTLE_SECONDS[settleIdx] + BUTTON_DELAY_SECONDS;
  const reveal = useBeat(progress, totalSeconds, start, totalSeconds - start);
  return /* @__PURE__ */ jsx15(
    ResponseButtons,
    {
      reveal,
      interestedLabel: strings.interestedButton,
      notNowLabel: strings.notNowButton,
      onInterested,
      onNotNow
    }
  );
}
function SalvationFlow({
  strings,
  isRtl: isRtl2,
  onInterested,
  onNotNow
}) {
  const [sceneIndex, setSceneIndex] = useState2(0);
  const scenes = strings.scenes;
  const isLast = sceneIndex === scenes.length - 1;
  const analytics = usePackageAnalytics();
  useEffect5(() => {
    analytics.logEvent("scene_view", { scene_index: sceneIndex });
    analytics.screenView(`followup_scene_${sceneIndex}`);
  }, [analytics, sceneIndex]);
  const advance = () => {
    analytics.logEvent("scene_advance", { scene_index: sceneIndex });
    setSceneIndex((i) => i >= scenes.length - 1 ? i : i + 1);
  };
  return /* @__PURE__ */ jsxs7(View9, { style: styles7.fill, children: [
    /* @__PURE__ */ jsx15(
      SceneContent,
      {
        sceneIndex,
        scene: scenes[sceneIndex],
        isRtl: isRtl2,
        totalCount: scenes.length
      },
      sceneIndex
    ),
    /* @__PURE__ */ jsx15(View9, { style: styles7.dotsWrap, pointerEvents: "none", children: /* @__PURE__ */ jsx15(SceneDots, { count: scenes.length, current: sceneIndex, isRtl: isRtl2 }) }),
    /* @__PURE__ */ jsx15(View9, { style: styles7.bottomWrap, children: isLast ? /* @__PURE__ */ jsx15(RevealResponse, { sceneIndex, strings, onInterested, onNotNow }, sceneIndex) : /* @__PURE__ */ jsx15(RevealNext, { sceneIndex, onAdvance: advance }, sceneIndex) })
  ] });
}
var styles7 = StyleSheet8.create({
  fill: { flex: 1, backgroundColor: colors.gradientTop },
  dotsWrap: { position: "absolute", top: 56, left: 0, right: 0 },
  bottomWrap: { position: "absolute", bottom: 64, left: 0, right: 0, alignItems: "center" },
  gapTop: { marginTop: 20 },
  gapSmall: { marginTop: 8 },
  gapMd: { marginTop: 16 },
  kicker: { fontSize: 20, color: colors.soft, textAlign: "center" },
  kickerLg: { fontSize: 24, color: colors.ink, textAlign: "center", lineHeight: 36 },
  headlineLg: { fontSize: 34, fontWeight: "700", color: colors.ink, textAlign: "center", lineHeight: 44 },
  headlineMd: { fontSize: 32, fontWeight: "700", color: colors.ink, textAlign: "center", lineHeight: 43 },
  gold: { color: colors.gold },
  verse: { fontSize: 22, color: colors.ink, textAlign: "center", lineHeight: 33 },
  verseGold: { fontSize: 22, color: colors.gold, fontWeight: "600", textAlign: "center", lineHeight: 33 },
  refRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  refRowRtl: { flexDirection: "row-reverse" },
  rule: { width: 40, height: 1, backgroundColor: colors.gold, opacity: 0.5 },
  refText: { fontSize: 16, fontWeight: "500", color: colors.gold, letterSpacing: 1, marginHorizontal: 14 }
});

// src/components/ContactScreen.tsx
import { View as View10, Text as Text5, Pressable as Pressable4, ScrollView, StyleSheet as StyleSheet9, I18nManager, SafeAreaView } from "react-native";
import * as Linking from "expo-linking";

// src/contactConfig.ts
import AsyncStorage2 from "@react-native-async-storage/async-storage";
var CONTACT_CHANNELS = ["whatsapp", "telegram", "messenger", "email"];
var DEFAULT_CONTACT_CONFIG_URL = "https://followup-web-simple.pages.dev/config.json";
var CONTACT_FALLBACK_PAGE_URL = "https://followup-web-simple.pages.dev/";
var CACHE_KEY = "follow_up_contact_config";
function parseContactConfig(raw) {
  const out = {};
  if (typeof raw !== "object" || raw === null) return out;
  for (const channel of CONTACT_CHANNELS) {
    const value = raw[channel];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) out[channel] = trimmed;
  }
  return out;
}
function availableChannels(config) {
  return CONTACT_CHANNELS.filter((c) => config[c]);
}
function contactUri(config, channel, prefilledMessage) {
  const value = config[channel];
  if (!value) return void 0;
  const encodedText = prefilledMessage ? encodeURIComponent(prefilledMessage) : void 0;
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ""}`;
    case "telegram":
      return `https://t.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ""}`;
    case "messenger":
      return `https://m.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ""}`;
    case "email":
      return `mailto:${value}${encodedText ? `?body=${encodedText}` : ""}`;
  }
}
async function loadContactConfig({
  url = DEFAULT_CONTACT_CONFIG_URL,
  timeoutMs = 6e3
} = {}) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: abort.signal });
    if (res.ok) {
      const body = await res.text();
      const parsed = parseContactConfig(JSON.parse(body));
      if (availableChannels(parsed).length > 0) {
        await AsyncStorage2.setItem(CACHE_KEY, body);
        return parsed;
      }
    }
  } catch (e) {
    console.warn("follow_up: contact config fetch failed", e);
  } finally {
    clearTimeout(timer);
  }
  const cached = await AsyncStorage2.getItem(CACHE_KEY);
  if (!cached) return null;
  try {
    const parsed = parseContactConfig(JSON.parse(cached));
    return availableChannels(parsed).length > 0 ? parsed : null;
  } catch {
    await AsyncStorage2.removeItem(CACHE_KEY);
    return null;
  }
}
async function debugClearContactCache() {
  await AsyncStorage2.removeItem(CACHE_KEY);
}

// src/components/ContactScreen.tsx
import { jsx as jsx16, jsxs as jsxs8 } from "react/jsx-runtime";
var BRAND = {
  whatsapp: "#25D366",
  telegram: "#229ED9",
  messenger: "#0084FF"
};
var LABEL = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  messenger: "Messenger"
};
function ContactScreen({
  config,
  strings,
  isRtl: isRtl2,
  onClose,
  onChannelOpened
}) {
  const chat = availableChannels(config).filter((c) => c !== "email");
  const open = async (channel) => {
    const uri = contactUri(config, channel, strings.prefilledMessage);
    if (!uri) return;
    onChannelOpened?.(channel);
    await Linking.openURL(uri);
  };
  const dir = { writingDirection: isRtl2 ? "rtl" : "ltr" };
  return /* @__PURE__ */ jsxs8(View10, { style: styles8.fill, children: [
    /* @__PURE__ */ jsx16(SceneFrame, { sunOpacity: 0.5, children: /* @__PURE__ */ jsxs8(
      ScrollView,
      {
        style: styles8.scroll,
        contentContainerStyle: styles8.scrollContent,
        showsVerticalScrollIndicator: false,
        children: [
          /* @__PURE__ */ jsx16(Text5, { style: [styles8.title, dir], children: strings.title }),
          /* @__PURE__ */ jsx16(Text5, { style: [styles8.intro, dir], children: strings.intro }),
          chat.map((channel) => /* @__PURE__ */ jsxs8(
            Pressable4,
            {
              onPress: () => open(channel),
              style: ({ pressed }) => [styles8.tile, isRtl2 && styles8.tileRtl, pressed && styles8.tilePressed],
              children: [
                /* @__PURE__ */ jsx16(View10, { style: [styles8.dot, { backgroundColor: BRAND[channel] }] }),
                /* @__PURE__ */ jsxs8(View10, { style: styles8.tileText, children: [
                  /* @__PURE__ */ jsx16(Text5, { style: [styles8.tileLabel, isRtl2 && styles8.textRight], children: LABEL[channel] }),
                  /* @__PURE__ */ jsx16(Text5, { style: [styles8.tileHint, isRtl2 && styles8.textRight, dir], children: hintFor(channel, strings) })
                ] }),
                /* @__PURE__ */ jsx16(Text5, { style: styles8.chevron, children: isRtl2 ? "\u2039" : "\u203A" })
              ]
            },
            channel
          )),
          config.email && /* @__PURE__ */ jsx16(Pressable4, { onPress: () => open("email"), style: styles8.emailWrap, hitSlop: 8, children: /* @__PURE__ */ jsxs8(Text5, { style: [styles8.email, dir], children: [
            strings.emailPrompt,
            " ",
            strings.emailAction
          ] }) })
        ]
      }
    ) }),
    onClose && /* @__PURE__ */ jsx16(SafeAreaView, { style: styles8.safeTop, pointerEvents: "box-none", children: /* @__PURE__ */ jsx16(View10, { style: [styles8.closeRow, isRtl2 && styles8.closeRowRtl], pointerEvents: "box-none", children: /* @__PURE__ */ jsx16(
      Pressable4,
      {
        accessibilityRole: "button",
        accessibilityLabel: "Close",
        onPress: onClose,
        hitSlop: 12,
        style: ({ pressed }) => [styles8.closeCircle, pressed && styles8.closePressed],
        children: /* @__PURE__ */ jsx16(Text5, { style: styles8.closeIcon, children: "\u2715" })
      }
    ) }) })
  ] });
}
function hintFor(channel, s) {
  return channel === "whatsapp" ? s.whatsappHint : channel === "telegram" ? s.telegramHint : s.messengerHint;
}
var styles8 = StyleSheet9.create({
  fill: { flex: 1 },
  safeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  closeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12
  },
  closeRowRtl: {
    flexDirection: "row-reverse"
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFCF5",
    borderWidth: 1,
    borderColor: "rgba(111,94,71,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  closePressed: { opacity: 0.7 },
  closeIcon: { fontSize: 16, fontWeight: "600", color: colors.soft, lineHeight: 18 },
  scroll: { alignSelf: "stretch" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: colors.ink, textAlign: "center", lineHeight: 36 },
  intro: { marginTop: 14, fontSize: 16, color: colors.soft, textAlign: "center", lineHeight: 25 },
  tile: {
    marginTop: 10,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(111,94,71,0.18)",
    backgroundColor: "#FFFCF5"
  },
  // I18nManager.isRTL already flips flex rows natively; this covers the case
  // where the app locale is LTR but the flow is showing Arabic copy.
  tileRtl: { flexDirection: I18nManager.isRTL ? "row" : "row-reverse" },
  tilePressed: { opacity: 0.7 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  tileText: { flex: 1, marginHorizontal: 14 },
  tileLabel: { fontSize: 17, fontWeight: "600", color: colors.ink },
  tileHint: { marginTop: 2, fontSize: 13, color: colors.soft },
  textRight: { textAlign: "right" },
  chevron: { fontSize: 26, color: colors.soft, lineHeight: 28 },
  emailWrap: { marginTop: 24, paddingVertical: 8 },
  email: { fontSize: 14, color: colors.soft, textAlign: "center" }
});

// src/debug.ts
var listeners = /* @__PURE__ */ new Set();
function subscribeToDebugTriggers(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function emit(request) {
  if (listeners.size === 0) {
    console.warn(
      `follow_up: no mounted <FollowUpGate> to show the "${request.stage}" stage \u2014 is the app wrapped in one?`
    );
    return;
  }
  for (const listener of listeners) listener(request);
}
function debugShowTeaser(opts = {}) {
  emit({ stage: "teaser", ...opts });
}
function debugShowFlow(opts = {}) {
  emit({ stage: "flow", ...opts });
}
function debugShowContact(opts = {}) {
  emit({ stage: "contact", ...opts });
}
async function debugReset() {
  const tracker = await FollowUpTracker.create();
  await tracker.debugReset();
  await debugClearContactCache();
}
async function debugForceReady(threshold = 40) {
  const tracker = await FollowUpTracker.create();
  await tracker.debugForceReady({ threshold });
}

// src/FollowUpGate.tsx
import { Fragment as Fragment2, jsx as jsx17, jsxs as jsxs9 } from "react/jsx-runtime";
function FollowUpGate({ analytics, ...props }) {
  if (!analytics) return /* @__PURE__ */ jsx17(Gate, { ...props });
  return /* @__PURE__ */ jsx17(PackageAnalyticsProvider, { analytics, children: /* @__PURE__ */ jsx17(Gate, { ...props }) });
}
function Gate({
  children,
  openThreshold = 40,
  reappearInterval = 10,
  delay = 1e4,
  showPopup = true,
  showTeaser,
  copyVariant,
  ctaUrl,
  contactConfigUrl = DEFAULT_CONTACT_CONFIG_URL,
  onInterested
}) {
  const [stage, setStage] = useState3("idle");
  const [strings, setStrings] = useState3(null);
  const [rtl, setRtl] = useState3(false);
  const [contact, setContact] = useState3(null);
  const trackerRef = useRef2(null);
  const mountedRef = useRef2(true);
  const analytics = usePackageAnalytics();
  const analyticsRef = useRef2(analytics);
  analyticsRef.current = analytics;
  useEffect6(() => {
    mountedRef.current = true;
    (async () => {
      const tracker = await FollowUpTracker.create();
      trackerRef.current = tracker;
      await tracker.recordOpen();
      if (!mountedRef.current) return;
      const shouldTrigger = await tracker.shouldTrigger({
        threshold: openThreshold,
        reappearInterval
      });
      analyticsRef.current.logEvent("gate_evaluated", {
        threshold: openThreshold,
        triggered: shouldTrigger
      });
      if (!shouldTrigger) return;
      await new Promise((r) => setTimeout(() => r(), delay));
      if (!mountedRef.current) return;
      const languageCode = Localization.getLocales()[0]?.languageCode ?? "en";
      setStrings(resolve(languageCode, copyVariant));
      setRtl(isRtl(languageCode));
      const shouldShowPopup = showPopup && (showTeaser ?? true);
      analyticsRef.current.setProperty("followup_locale", languageCode);
      if (shouldShowPopup) {
        setStage("teaser");
        analyticsRef.current.logEvent("teaser_shown", { locale: languageCode });
        analyticsRef.current.screenView("followup_teaser");
      } else {
        setStage("flow");
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect6(
    () => subscribeToDebugTriggers(async ({ stage: target, locale, config }) => {
      const languageCode = locale ?? Localization.getLocales()[0]?.languageCode ?? "en";
      setStrings(resolve(languageCode, copyVariant));
      setRtl(isRtl(languageCode));
      if (target !== "contact") {
        setStage(target);
        return;
      }
      const resolved = config ?? await loadContactConfig({ url: contactConfigUrl });
      if (!mountedRef.current) return;
      if (!resolved) {
        console.warn(`follow_up: no contact config available from ${contactConfigUrl}`);
        return;
      }
      setContact(resolved);
      setStage("contact");
    }),
    [contactConfigUrl]
  );
  const dismissTeaser = async () => {
    await trackerRef.current?.recordDismiss();
    analytics.logEvent("teaser_dismissed");
    setStage("idle");
  };
  const respond = async (interested) => {
    analytics.logEvent("response", { interested });
    if (!interested) {
      await trackerRef.current?.recordDismiss();
      setStage("idle");
      return;
    }
    await trackerRef.current?.markShown();
    await onInterested?.();
    if (ctaUrl) {
      setStage("idle");
      await Linking2.openURL(ctaUrl);
      analytics.logEvent("cta_opened", { url: ctaUrl });
      return;
    }
    const config = await loadContactConfig({ url: contactConfigUrl });
    if (!mountedRef.current) return;
    if (!config) {
      setStage("idle");
      analytics.logEvent("contact_fallback_url");
      await Linking2.openURL(CONTACT_FALLBACK_PAGE_URL);
      return;
    }
    setContact(config);
    setStage("contact");
    analytics.logEvent("contact_shown");
    analytics.screenView("followup_contact");
  };
  return /* @__PURE__ */ jsxs9(Fragment2, { children: [
    children,
    strings && stage === "teaser" && /* @__PURE__ */ jsx17(Modal, { visible: true, transparent: true, animationType: "fade", onRequestClose: dismissTeaser, children: /* @__PURE__ */ jsx17(
      TeaserPopup,
      {
        strings,
        isRtl: rtl,
        onClose: dismissTeaser,
        onLearnMore: () => {
          analytics.logEvent("teaser_learn_more");
          setStage("flow");
        }
      }
    ) }),
    strings && stage === "flow" && /* @__PURE__ */ jsx17(Modal, { visible: true, animationType: "slide", presentationStyle: "fullScreen", onRequestClose: () => {
    }, children: /* @__PURE__ */ jsx17(SalvationFlow, { strings, isRtl: rtl, onInterested: () => respond(true), onNotNow: () => respond(false) }) }),
    strings && contact && stage === "contact" && // Dismissible, unlike the flow — by this point the visitor has already
    // answered, and trapping someone who wanted to talk defeats the point.
    /* @__PURE__ */ jsx17(Modal, { visible: true, animationType: "slide", presentationStyle: "fullScreen", onRequestClose: () => setStage("idle"), children: /* @__PURE__ */ jsx17(
      ContactScreen,
      {
        config: contact,
        strings: strings.contact,
        isRtl: rtl,
        onClose: () => setStage("idle"),
        onChannelOpened: (channel) => analytics.logEvent("contact_channel_opened", { channel })
      }
    ) })
  ] });
}

// src/analytics/multi.ts
function multiAnalytics(impls) {
  const fanOut = (run) => {
    for (const impl of impls) {
      try {
        const result = run(impl);
        if (result && typeof result.catch === "function") {
          result.catch(() => {
          });
        }
      } catch {
      }
    }
  };
  return {
    logEvent: (name, params) => fanOut((i) => i.logEvent(name, params)),
    setUserId: (id2) => fanOut((i) => i.setUserId(id2)),
    setProperty: (key, value) => fanOut((i) => i.setProperty(key, value)),
    screenView: (screenName) => fanOut((i) => i.screenView(screenName))
  };
}
export {
  CONTACT_CHANNELS,
  CONTACT_FALLBACK_PAGE_URL,
  ContactScreen,
  DEFAULT_CONTACT_CONFIG_URL,
  DEFAULT_EVENT_PREFIX,
  FollowUpGate,
  FollowUpTracker,
  PackageAnalyticsProvider,
  locales_exports as SupportedLocales,
  availableChannels,
  contactUri,
  debugClearContactCache,
  debugForceReady,
  debugReset,
  debugShowContact,
  debugShowFlow,
  debugShowTeaser,
  loadContactConfig,
  multiAnalytics,
  noopAnalytics,
  parseContactConfig,
  usePackageAnalytics
};
//# sourceMappingURL=index.mjs.map