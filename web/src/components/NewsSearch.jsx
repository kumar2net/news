import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api";

const formatPublishedAt = (value) => {
  if (!value) return "Just in";
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Just in";
  }
};

export default function NewsSearch() {
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState([]);
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const apiKey = useMemo(() => import.meta.env?.VITE_NEWS_API_KEY, []);

  useEffect(() => {
    if (!topics.length) {
      setArticles([]);
      return;
    }

    const controller = new AbortController();

    const fetchTopics = async () => {
      setStatus("loading");
      setError(null);

      try {
        const requests = topics.map((topic) => {
          const params = new URLSearchParams({
            q: topic,
            language: "en",
            sortBy: "publishedAt",
            pageSize: "5",
          });

          const url =
            apiKey && apiKey.length > 0
              ? `https://newsapi.org/v2/everything?${params.toString()}&apiKey=${apiKey}`
              : `${API_BASE}/search-news?${params.toString()}`;

          return fetch(url, { signal: controller.signal }).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to load “${topic}”`);
            }
            return res.json();
          });
        });

        const results = await Promise.all(requests);
        const merged = results
          .flatMap(({ articles: topicArticles = [] }) => topicArticles)
          .filter(
            (article, index, self) =>
              self.findIndex((candidate) => candidate.url === article.url) ===
              index,
          )
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime(),
          );

        setArticles(merged);
        setStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unexpected error");
          setStatus("error");
        }
      }
    };

    fetchTopics();

    return () => controller.abort();
  }, [topics, apiKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = query
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setTopics(parsed);
  };

  const handleTopicRemove = (value) => {
    setTopics((current) => current.filter((topic) => topic !== value));
  };

  const handleClearAll = () => {
    setTopics([]);
    setQuery("");
  };

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(94,53,177,0.08)]">
          <h3 className="text-xl font-semibold text-slate-900">
            Craft your search
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Separate topics with commas. We’ll fetch five fresh stories per
            topic and blend them together.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
              Topics
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="gen ai, pixel, mac os"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner focus:border-[#5e35b1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5e35b1]/20"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs font-medium text-slate-400 sm:inline">
                  Press Enter ↵
                </span>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5e35b1] to-[#7c4dff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#5e35b1]/30 focus:ring-offset-1 focus:ring-offset-white"
              >
                Run search
              </button>
            </div>
          </form>

          {topics.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicRemove(topic)}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-600 transition hover:border-[#5e35b1]/60 hover:bg-[#ede7f6] hover:text-[#5e35b1]"
                >
                  <span className="capitalize">{topic}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-400 group-hover:border-[#5e35b1] group-hover:text-[#5e35b1]">
                    ×
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm font-semibold text-[#5e35b1] underline-offset-4 transition hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-white/70 bg-gradient-to-br from-white via-[#ede7f6] to-white p-6 shadow-[0_10px_40px_rgba(124,77,255,0.12)]">
          <h3 className="text-base font-semibold text-[#5e35b1]">
            Tips for richer results
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-[#5e35b1]" />
              Combine broad and niche topics for balanced coverage.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-[#5e35b1]" />
              Add keywords like “launch” or “rumor” for product scoops.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-[#5e35b1]" />
              Remove a chip to refocus if results feel noisy.
            </li>
          </ul>
        </aside>
      </div>

      <section className="space-y-4">
        {status === "idle" && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            Start curating by entering a few topics above.
          </div>
        )}

        {status === "loading" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 h-4 w-24 rounded-full bg-slate-200" />
                <div className="mb-4 h-6 w-3/4 rounded-full bg-slate-200" />
                <div className="mb-2 h-3 rounded-full bg-slate-100" />
                <div className="mb-2 h-3 w-5/6 rounded-full bg-slate-100" />
                <div className="mb-2 h-3 w-2/3 rounded-full bg-slate-100" />
                <div className="mt-6 h-8 w-24 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error || "Something went wrong. Please try again."}
          </div>
        )}

        {status === "success" && articles.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No articles found for the requested topics. Try adjusting keywords
            or include broader synonyms.
          </div>
        )}

        {articles.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5e35b1]">
                  Latest Articles
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Curated coverage across {topics.length} topic
                  {topics.length === 1 ? "" : "s"}
                </h3>
              </div>
              <span className="text-sm text-slate-500">
                Showing {articles.length} articles sorted by freshness
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.url}
                  className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#5e35b1]/60 hover:shadow-[0_20px_60px_rgba(94,53,177,0.18)]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      <span className="rounded-full border border-[#5e35b1]/30 bg-[#ede7f6] px-2 py-1 text-[10px] text-[#5e35b1]">
                        {article.source?.name ?? "Unknown Source"}
                      </span>
                      <span>{formatPublishedAt(article.publishedAt)}</span>
                    </div>
                    <h4 className="text-lg font-semibold leading-tight text-slate-900">
                      {article.title}
                    </h4>
                    {article.description && (
                      <p className="text-sm leading-relaxed text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                        {article.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {article.author
                        ? `By ${article.author}`
                        : "Curated for you"}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#f3e5f5] px-4 py-2 text-sm font-semibold text-[#5e35b1] transition hover:border-[#5e35b1]/40 hover:bg-[#e1bee7]"
                    >
                      Read article
                      <span aria-hidden className="text-lg leading-none">
                        →
                      </span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
