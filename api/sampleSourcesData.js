const SAMPLE_SOURCES = [
  {
    id: "tehran-times",
    name: "Tehran Times",
    description: "روزنامه انگلیسی زبان ایران با تمرکز بر سیاست و اقتصاد.",
    url: "https://www.tehrantimes.com",
    category: "general",
    language: "fa",
    country: "ir",
  },
  {
    id: "iran-daily",
    name: "Iran Daily",
    description:
      "A state-run daily covering national policy, regional relations, and energy.",
    url: "https://www.irandaily.ir",
    category: "general",
    language: "en",
    country: "ir",
  },
  {
    id: "reuters",
    name: "Reuters World Desk",
    description:
      "Breaking coverage on markets, geopolitics, and technology from bureaus across the globe.",
    url: "https://www.reuters.com",
    category: "general",
    language: "en",
    country: "us",
  },
  {
    id: "dw",
    name: "Deutsche Welle",
    description:
      "Nachrichten aus Deutschland und der Welt mit Fokus auf Politik, Wirtschaft und Kultur.",
    url: "https://www.dw.com",
    category: "general",
    language: "de",
    country: "de",
  },
  {
    id: "le-monde",
    name: "Le Monde",
    description:
      "Analyse approfondie de l'actualité française et internationale pour un public global.",
    url: "https://www.lemonde.fr",
    category: "general",
    language: "fr",
    country: "fr",
  },
  {
    id: "al-jazeera-english",
    name: "Al Jazeera",
    description:
      "Coverage from the Middle East and beyond on diplomacy, society, and climate.",
    url: "https://www.aljazeera.com",
    category: "general",
    language: "en",
    country: "qa",
  },
  {
    id: "asahi-shimbun",
    name: "朝日新聞デジタル",
    description: "国内外のニュースをミレニアル視点で深掘りする日本の主要紙。",
    url: "https://www.asahi.com",
    category: "general",
    language: "ja",
    country: "jp",
  },
];

const getSampleSources = (country = "us") => {
  const filtered = SAMPLE_SOURCES.filter(
    (source) => source.country?.toLowerCase() === country.toLowerCase(),
  );

  if (filtered.length) {
    return filtered;
  }

  return SAMPLE_SOURCES.filter((source) => source.country !== "ir");
};

module.exports = { getSampleSources };
