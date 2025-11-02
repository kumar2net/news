import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

export type Status = "idle" | "loading" | "success" | "error";

interface Article {
  url: string;
  title: string;
  description: string | null;
  urlToImage?: string | null;
  source?: { name?: string };
  publishedAt?: string;
  author?: string | null;
}

const API_BASE = "/api";
const STORAGE_KEY = "news_topics";

export type Timeframe = "today" | "recent" | "deep";

export interface BriefingSummary {
  headline: string;
  subheadline: string;
  totalArticles: number;
  sentiment: number;
  sourceDiversity: number;
  trend: "up" | "down" | "steady";
}

export const EMPTY_BRIEFING_SUMMARY: BriefingSummary = {
  headline: "Add topics to craft your smart briefing",
  subheadline: "Choose a timeframe to see AI summaries and automation-ready insights.",
  totalArticles: 0,
  sentiment: 0.5,
  sourceDiversity: 0,
  trend: "steady",
};

interface NewsSearchProps {
  timeframe?: Timeframe;
  onSummaryChange?: (summary: BriefingSummary) => void;
}

const positiveKeywords = [
  "growth",
  "rise",
  "gain",
  "record",
  "surge",
  "win",
  "boost",
  "partnership",
];

const negativeKeywords = [
  "fall",
  "drop",
  "loss",
  "crisis",
  "concern",
  "warning",
  "decline",
  "risk",
];

const timeframeLabels: Record<Timeframe, string> = {
  today: "today",
  recent: "the last 24 hours",
  deep: "deep dives",
};

const getStoredTopics = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const formatPublishedAt = (value?: string) => {
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

const formatRelativeTime = (date: Date) =>
  new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60)),
    "minute",
  );

export default function NewsSearch({
  timeframe = "today",
  onSummaryChange,
}: NewsSearchProps) {
  const initialTopicsRef = React.useRef<string[]>(getStoredTopics());
  const [topics, setTopics] = React.useState<string[]>(
    initialTopicsRef.current,
  );
  const [query, setQuery] = React.useState(() =>
    initialTopicsRef.current.join(", "),
  );
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = React.useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [refreshNonce, setRefreshNonce] = React.useState(0);
  const previousTotalRef = React.useRef(0);

  const apiKey = React.useMemo(() => {
    try {
      const value = (import.meta as any)?.env?.VITE_NEWS_API_KEY;
      return typeof value === "string" ? value : undefined;
    } catch {
      return undefined;
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (topics.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [topics]);

  const mergeArticles = React.useCallback((incoming: Article[]) => {
    if (!incoming.length) return;
    setArticles((current) => {
      const combined = [...current];
      incoming.forEach((article) => {
        if (!article?.url) return;
        if (!combined.some((candidate) => candidate.url === article.url)) {
          combined.push(article);
        }
      });
      return combined.sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime(),
      );
    });
  }, []);

  React.useEffect(() => {
    if (!topics.length) {
      setArticles([]);
      setSuggestedTopics([]);
      setStatus("idle");
      setError(null);
      setLastUpdated(null);
      previousTotalRef.current = 0;
      onSummaryChange?.(EMPTY_BRIEFING_SUMMARY);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setArticles([]);
    setStatus("loading");
    setError(null);
    setLastUpdated(null);

    const now = new Date();
    const paramsForTimeframe = (topic: string) => {
      const params = new URLSearchParams({
        q: topic,
        language: "en",
        pageSize: timeframe === "deep" ? "8" : "5",
      });

      if (timeframe === "deep") {
        params.set("sortBy", "relevancy");
      } else {
        params.set("sortBy", "publishedAt");
        const from = new Date(now);
        if (timeframe === "today") {
          from.setHours(0, 0, 0, 0);
        } else if (timeframe === "recent") {
          from.setTime(now.getTime() - 24 * 60 * 60 * 1000);
        }
        params.set("from", from.toISOString());
      }

      return params;
    };

    const fetchTopic = async (topic: string) => {
      const params = paramsForTimeframe(topic);
      const baseUrl =
        apiKey && apiKey.length > 0
          ? `https://newsapi.org/v2/everything?${params.toString()}&apiKey=${apiKey}`
          : `${API_BASE}/search-news?${params.toString()}`;

      const response = await fetch(baseUrl, { signal: controller.signal });
      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.slice(0, 120) || `Failed to load “${topic}”`);
      }

      const data = await response.json();

      if (!response.ok) {
        const message =
          (data && (data.error || data.message)) || `Failed to load “${topic}”`;
        throw new Error(message);
      }

      const resolvedArticles = Array.isArray(data.articles) ? data.articles : [];
      mergeArticles(resolvedArticles);
      return resolvedArticles;
    };

    const load = async () => {
      const results = await Promise.allSettled(topics.map(fetchTopic));
      if (cancelled) return;

      const rejected = results.filter((result) => result.status === "rejected");
      const fulfilled = results.filter(
        (result): result is PromiseFulfilledResult<Article[]> =>
          result.status === "fulfilled",
      );

      if (!fulfilled.length) {
        setStatus("error");
        setError(
          rejected[0]?.reason?.message ||
            `We couldn't load any stories for ${topics.join(", ")}`,
        );
        return;
      }

      if (rejected.length) {
        const topicErrors = rejected
          .map((item) => String(item.reason?.message || ""))
          .filter(Boolean)
          .slice(0, 2)
          .join(". ");
        setError(
          topicErrors ||
            "Some topics responded slowly. Showing available coverage instead.",
        );
      } else {
        setError(null);
      }

      setLastUpdated(new Date());
      setStatus("success");
    };

    load().catch((err: Error) => {
      if (err.name === "AbortError" || cancelled) return;
      setError(err.message);
      setStatus("error");
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [topics, apiKey, timeframe, mergeArticles, refreshNonce, onSummaryChange]);

  const addTopic = React.useCallback((value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setTopics((current) => {
      if (current.includes(normalized)) return current;
      const next = [...current, normalized].slice(0, 10);
      setQuery(next.join(", "));
      return next;
    });
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Array.from(
      new Set(
        query
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
    setTopics(parsed);
    setQuery(parsed.join(", "));
  };

  const handleTopicRemove = (value: string) => {
    setTopics((current) => {
      const next = current.filter((topic) => topic !== value);
      setQuery(next.join(", "));
      return next;
    });
  };

  const handleClearAll = () => {
    setTopics([]);
    setQuery("");
    onSummaryChange?.(EMPTY_BRIEFING_SUMMARY);
  };

  const handleRefresh = () => {
    if (!topics.length) return;
    setRefreshNonce((value) => value + 1);
  };

  React.useEffect(() => {
    if (!articles.length) {
      setSuggestedTopics([]);
      previousTotalRef.current = 0;
      if (!topics.length) {
        onSummaryChange?.(EMPTY_BRIEFING_SUMMARY);
      }
      return;
    }

    const counts = new Map<string, number>();
    const textContent = articles
      .map((article) => `${article.title ?? ""} ${article.description ?? ""}`)
      .join(" ")
      .toLowerCase();

    textContent.split(/[^a-zA-Z]+/).forEach((word) => {
      if (word.length < 5) return;
      if (topics.some((topic) => topic.toLowerCase() === word)) return;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });

    const suggested = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    setSuggestedTopics(suggested);

    const allWords = textContent.split(/[^a-zA-Z]+/).filter(Boolean);
    const positiveHits = allWords.filter((word) =>
      positiveKeywords.includes(word),
    ).length;
    const negativeHits = allWords.filter((word) =>
      negativeKeywords.includes(word),
    ).length;
    const sentimentScore =
      positiveHits + negativeHits === 0
        ? 0.5
        : Math.min(
            1,
            Math.max(
              0,
              (positiveHits - negativeHits + (positiveHits + negativeHits)) /
                (2 * (positiveHits + negativeHits)),
            ),
          );

    const sources = new Set(
      articles
        .map((article) => article.source?.name)
        .filter((name): name is string => Boolean(name)),
    );

    const summary: BriefingSummary = {
      headline: articles[0]?.title ?? "Curated briefing ready",
      subheadline: `Tracking ${articles.length} stories from ${sources.size} sources ${
        timeframeLabels[timeframe]
      }.`,
      totalArticles: articles.length,
      sentiment: sentimentScore,
      sourceDiversity: sources.size,
      trend:
        articles.length > previousTotalRef.current
          ? "up"
          : articles.length < previousTotalRef.current
            ? "down"
            : "steady",
    };

    previousTotalRef.current = articles.length;
    onSummaryChange?.(summary);
  }, [articles, onSummaryChange, timeframe, topics]);

  return (
    <Stack spacing={6}>
      <Paper
        variant="outlined"
        sx={{
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 4 },
          borderRadius: 4,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Build a tailored briefing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Separate topics with commas. We pull in near real-time coverage and
              merge it into a single, curated feed.
            </Typography>
          </Box>
          <Tooltip title="Refresh briefing">
            <span>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={!topics.length || status === "loading"}
              >
                Refresh
              </Button>
            </span>
          </Tooltip>
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
        >
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            label="Topics"
            placeholder="gen ai, pixel, mac os"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              minWidth: { sm: 140 },
            }}
          >
            Run search
          </Button>
        </Box>

        {topics.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            {topics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                onDelete={() => handleTopicRemove(topic)}
                color="primary"
                variant="outlined"
                sx={{ textTransform: "capitalize" }}
              />
            ))}
            <Button size="small" onClick={handleClearAll}>
              Clear all
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TipsAndUpdatesIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Power tips
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Blend macro themes with niche curiosities, then pin emerging topics
            from the suggested list below. Each refresh rebalances recency,
            relevancy, and source diversity.
          </Typography>
          {suggestedTopics.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {suggestedTopics.map((topic) => (
                <Chip
                  key={topic}
                  icon={<TrendingUpIcon />}
                  label={topic}
                  onClick={() => addTopic(topic)}
                  sx={{ textTransform: "capitalize" }}
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Box>
        {status === "idle" && (
          <Paper
            variant="outlined"
            sx={{
              py: 6,
              px: 3,
              textAlign: "center",
              borderRadius: 4,
              color: "text.secondary",
            }}
          >
            Start curating by entering a few topics above.
          </Paper>
        )}

        {status === "loading" && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">
              Collecting the latest stories…
            </Typography>
          </Stack>
        )}

        {error && status !== "loading" && (
          <Alert severity={status === "error" ? "error" : "warning"}>
            {error}
          </Alert>
        )}

        {status === "success" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {articles.length > 0
                ? `Curated stream (${articles.length} articles)`
                : "No articles found for your topics"}
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Updated {formatRelativeTime(lastUpdated)}
              </Typography>
            )}
            <Grid container spacing={3}>
              {articles.map((article) => (
                <Grid key={article.url} size={{ xs: 12, md: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="overline" color="text.secondary">
                          {article.source?.name ?? "Unknown source"}
                        </Typography>
                        <Typography variant="h6">{article.title}</Typography>
                        {article.description && (
                          <Typography variant="body2" color="text.secondary">
                            {article.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatPublishedAt(article.publishedAt)}
                        </Typography>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 3, pb: 3 }}>
                      <Button
                        component={MuiLink}
                        href={article.url}
                        target="_blank"
                        rel="noopener"
                        variant="outlined"
                      >
                        Read article
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Stack>
  );
}
