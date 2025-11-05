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
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

type Status = "idle" | "loading" | "success" | "error";

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

export default function NewsSearch() {
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

  const apiKey = React.useMemo(() => {
    try {
      const envRecord = import.meta.env as unknown as Record<string, unknown>;
      const value = envRecord?.VITE_NEWS_API_KEY;
      return typeof value === "string" && value.length > 0 ? value : undefined;
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

  React.useEffect(() => {
    if (!topics.length) {
      setArticles([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    const fetchArticles = async () => {
      setStatus("loading");
      setError(null);

      try {
        const requests = topics.map(async (topic) => {
          const params = new URLSearchParams({
            q: topic,
            language: "en",
            sortBy: "publishedAt",
            pageSize: "5",
          });

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
              (data && (data.error || data.message)) ||
              `Failed to load “${topic}”`;
            throw new Error(message);
          }

          return Array.isArray(data.articles) ? data.articles : [];
        });

        const resolved = await Promise.all(requests);
        const merged = resolved
          .flat()
          .filter((article): article is Article =>
            Boolean(article && article.url),
          )
          .filter(
            (article, index, self) =>
              self.findIndex((candidate) => candidate.url === article.url) ===
              index,
          )
          .sort(
            (a, b) =>
              new Date(b.publishedAt ?? 0).getTime() -
              new Date(a.publishedAt ?? 0).getTime(),
          );

        setArticles(merged);
        setStatus("success");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        setError((err as Error)?.message || "Unexpected error");
        setStatus("error");
      }
    };

    fetchArticles();

    return () => controller.abort();
  }, [topics, apiKey]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = query
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setTopics(parsed);
  };

  const handleTopicRemove = (value: string) => {
    setTopics((current) => current.filter((topic) => topic !== value));
  };

  const handleClearAll = () => {
    setTopics([]);
    setQuery("");
  };

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
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Build a tailored briefing
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Separate topics with commas. We will fetch the five freshest stories
          for each topic and blend them into one stream.
        </Typography>

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

        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Tips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Combine broad and niche topics for balanced coverage. Remove a chip
            to refocus if results feel noisy.
          </Typography>
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

        {status === "error" && error && <Alert severity="error">{error}</Alert>}

        {status === "success" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {articles.length > 0
                ? `Curated stream (${articles.length} articles)`
                : "No articles found for your topics"}
            </Typography>
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
