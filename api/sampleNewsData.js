const SAMPLE_ARTICLES = [
  {
    title: "اقتصاد ایران در مسیر بازگشت به رشد",
    description:
      "گزارش تازه اتاق بازرگانی نشان می‌دهد سرمایه‌گذاری‌های تازه به بهبود وضعیت اشتغال کمک کرده است.",
    url: "https://example.com/iran-economy-growth",
    source: { name: "Tehran Business Review" },
    country: "ir",
    origin: "ir",
    translations: {
      en: {
        title: "Iran's economy charts a path back to growth",
        description:
          "A new chamber of commerce report says fresh investment is lifting employment prospects.",
      },
    },
  },
  {
    title: "Parliament advances electoral reform bill",
    description:
      "Lawmakers passed the first article of a sweeping reform package focused on voter registration.",
    url: "https://example.com/iran-parliament-reform",
    source: { name: "IRNA" },
    country: "ir",
    origin: "ir",
  },
  {
    title: "Global oil markets steady as OPEC+ signals output flexibility",
    description:
      "Energy ministers indicated the bloc could adjust production targets if demand weakens.",
    url: "https://example.com/opec-market-update",
    source: { name: "Reuters" },
    country: "ae",
    origin: "global",
  },
  {
    title: "EU ministers meet in Brussels to coordinate sanctions policy",
    description:
      "Officials are weighing new measures while maintaining support for diplomatic channels.",
    url: "https://example.com/eu-ministers-meeting",
    source: { name: "Politico Europe" },
    country: "be",
    origin: "global",
  },
];

const normalizeOrigin = (value = "mixed") => {
  if (value === "ir" || value === "global") return value;
  return "mixed";
};

const filterByOrigin = (origin) => {
  if (origin === "ir") {
    return SAMPLE_ARTICLES.filter((article) => article.country === "ir");
  }

  if (origin === "global") {
    return SAMPLE_ARTICLES.filter((article) => article.country !== "ir");
  }

  return SAMPLE_ARTICLES;
};

const toClientShape = (article) => ({
  title: article.title,
  description: article.description ?? null,
  url: article.url,
  source: { name: article.source?.name ?? "Unknown source" },
  country: article.country ?? null,
  origin: article.origin ?? null,
  ...(article.translations ? { translations: article.translations } : {}),
});

const getSampleArticles = (origin) => {
  const normalized = normalizeOrigin(origin);
  return filterByOrigin(normalized).map(toClientShape);
};

module.exports = { getSampleArticles };
