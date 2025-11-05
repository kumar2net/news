import ArticleIcon from "@mui/icons-material/Article";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";

interface HeadlineArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage?: string | null;
  source?: { name?: string };
  publishedAt?: string;
}

const headlineCategories: { value: string; label: string }[] = [
  { value: "general", label: "Top" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Tech" },
  { value: "science", label: "Science" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "health", label: "Health" },
];

const API_BASE = "/api";

const formatDate = (input?: string) => {
  if (!input) return "Just in";
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(input));
  } catch {
    return "Just in";
  }
};

export default function TopHeadlinesPanel() {
  const [category, setCategory] = React.useState<string>("technology");
  const [articles, setArticles] = React.useState<HeadlineArticle[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error" | "success">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = React.useState(0);

  const apiKey = React.useMemo(() => {
    try {
      const value = (import.meta as any)?.env?.VITE_NEWS_API_KEY;
      return typeof value === "string" ? value : undefined;
    } catch {
      return undefined;
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchHeadlines = async () => {
      setStatus("loading");
      setError(null);

      const params = new URLSearchParams({
        category,
        pageSize: "6",
      });
      const targetUrl =
        apiKey && apiKey.length > 0
          ? `https://newsapi.org/v2/top-headlines?${params.toString()}&apiKey=${apiKey}`
          : `${API_BASE}/top-headlines?${params.toString()}`;

      try {
        const response = await fetch(targetUrl, { signal: controller.signal });
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error("Unexpected response from headlines endpoint");
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Unable to load headlines");
        }

        const incoming = Array.isArray(data?.articles) ? data.articles : [];
        if (!cancelled) {
          setArticles(incoming.slice(0, 6));
          setStatus("success");
        }
      } catch (err) {
        if (cancelled || (err as Error)?.name === "AbortError") return;
        setStatus("error");
        setError((err as Error).message);
      }
    };

    fetchHeadlines();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category, apiKey, refreshNonce]);

  const handleRefresh = () => setRefreshNonce((value) => value + 1);

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
          <ArticleIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Top headlines radar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Powered by the <strong>get_top_headlines</strong> MCP tool. Switch categories
            to explore breaking stories you can automate instantly.
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={status === "loading"}
        >
          Refresh
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {headlineCategories.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            color={category === item.value ? "primary" : "default"}
            onClick={() => setCategory(item.value)}
            icon={category === item.value ? <TrendingUpIcon /> : undefined}
            variant={category === item.value ? "filled" : "outlined"}
            sx={{ textTransform: "capitalize" }}
          />
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
        {status === "loading" && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Loading headlines…</Typography>
          </Stack>
        )}

        {status === "error" && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {status === "success" && articles.length === 0 && (
          <Typography color="text.secondary">No headlines found.</Typography>
        )}

        {status === "success" && articles.length > 0 && (
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid key={article.url} size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
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
                        {formatDate(article.publishedAt)}
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
                      Read
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {status === "success" && (
        <Typography variant="caption" color="text.secondary">
          These stories are mirrored in your MCP workspace so automations stay in
          sync with this dashboard view.
        </Typography>
      )}

      {status === "loading" && (
        <Typography variant="caption" color="text.secondary">
          Fetching via REST proxy & MCP simultaneously…
        </Typography>
      )}
    </Stack>
  );
}
