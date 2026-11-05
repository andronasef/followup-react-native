import type { ContactStrings, FollowUpStrings } from "../types";

const arContact: ContactStrings = {
  title: "إحنا هنا دايماً علشانك.",
  intro:
    "سواء عندك أسئلة، حابب تفضفض، أو عاوز تعرف أكتر.. يسعدنا جداً نتكلم معاك. اختار التطبيق اللي ترتاح فيه، وبراحتك تماماً وفي أي وقت.",
  whatsappHint: "شات سريع ومباشر",
  telegramHint: "بسيط وبكل خصوصية",
  messengerHint: "كلمنا على فيسبوك",
  emailPrompt: "بترتاح أكثر في الإيميل؟",
  emailAction: "راسلنا في أي وقت",
  prefilledMessage: "عاوز اعرف عن اللي انت بتتكلم عنه اكتر!",
};

// Track 1: المحبة غير المشروطة (Unconditional Love)
export const arLove: FollowUpStrings = {
  popupHeadline: "فيه حد بيحبك بجد.. حب ملوش شروط.",
  popupBody:
    "المسيح بيحبك حب حقيقي ومش مستني منك تعمل أي حاجة علشان يحبك.. حبك زي ما أنت من غير ما تحتاج تثبت نفسك. خد دقيقة واعرف أكتر.",
  learnMoreButton: "اعرف المزيد",
  interestedButton: "عاوز أعرف أكتر",
  notNowButton: "مش دلوقتي",
  scenes: [
    {
      kicker: "تعبت من إرضاء الناس؟",
      headline: "المسيح بيحبك زي ما أنت.",
      verse: "مَحَبَّةً أَبَدِيَّةً أَحْبَبْتُكَ.. أَدَمْتُ لَكَ الرَّحْمَةَ.",
      reference: "إرميا 31: 3",
    },
    {
      headline: "افتح له قلبك دلوقتي.",
      verse: "هو مش مستنيك تصلح نفسك الأول.. تعالَ زي ما أنت.",
    },
  ],
  contact: arContact,
};

// Track 2: المسيح الشافي (The Healer)
export const arHealer: FollowUpStrings = {
  popupHeadline: "تعبان أو متألم؟ فيه شفا ورجاء ليك.",
  popupBody:
    "المسيح الشافي يقدر يلمس ويشفي أي مرض وأي ضعف مهما كان.. ولو مش مصدق، تعالى بس وجرب، مش هتخسر حاجة.",
  learnMoreButton: "اعرف المزيد",
  interestedButton: "محتاج الشفاء ده",
  notNowButton: "مش دلوقتي",
  scenes: [
    {
      kicker: "لما المرض يهد حيلتك..",
      headline: "المسيح يقدر يشفي أي وجع.",
      verse: "أَحْزَانَنَا حَمَلَهَا، وَأَوْجَاعَنَا تَحَمَّلَهَا.. وَبِجِرَاحِهِ شُفِينَا.",
      reference: "إشعياء 53: 4-5",
    },
    {
      headline: "جرب.. مش هتخسر حاجة.",
      verse: "تعال وسلمه وجعك وشوف إيده هتعمل إيه في حياتك.",
    },
  ],
  contact: arContact,
};

// Track 3: الله غافر الخطايا (Forgiveness of Sins)
export const arForgiveness: FollowUpStrings = {
  popupHeadline: "كلنا بنغلط.. بس رحمة ربنا أكبر من أي ذنب.",
  popupBody:
    "كلنا أخطأنا وبعدنا، لكن الله غفر خطايانا كلها وأحبنا.. ومستنيك ترجع له وتبدأ صفحة جديدة.",
  learnMoreButton: "اعرف المزيد",
  interestedButton: "عاوز أبدأ من جديد",
  notNowButton: "مش دلوقتي",
  scenes: [
    {
      kicker: "حاسس إن ذنوبك مكتّفاك؟",
      headline: "كلنا غلطنا.. بس رحمته أكبر.",
      verse: "إِنْ كَانَتْ خَطَايَاكُمْ كَالْقِرْمِزِ تَبْيَضُّ كَالثَّلْجِ.",
      reference: "إشعياء 1: 18",
    },
    {
      headline: "ارتاح وابدأ من جديد.",
      verse: "الله غفر كل خطايانا وأحبنا.. تعالى وابدأ حياة جديدة بسلام.",
    },
  ],
  contact: arContact,
};

export const arVariants = [arLove, arHealer, arForgiveness] as const;
export const ar = arLove;
