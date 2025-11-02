import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";

interface SourceItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  country: string;
  language: string;
}

const API_BASE = "/api";

const categories = [
  "technology",
  "business",
  "science",
  "entertainment",
  "sports",
  "health",
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

export default function SourceSpotlight() {
  const [category, setCategory] = React.useState<string>("technology");
  const [language, setLanguage] = React.useState<string>("en");
  const [sources, setSources] = React.useState<SourceItem[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error" | "success">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

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

    const fetchSources = async () => {
      setStatus("loading");
      setError(null);

      const params = new URLSearchParams({
        language,
        category,
      });

      const targetUrl =
        apiKey && apiKey.length > 0
          ? `https://newsapi.org/v2/top-headlines/sources?${params.toString()}&apiKey=${apiKey}`
          : `${API_BASE}/get-sources?${params.toString()}`;

      try {
        const response = await fetch(targetUrl, { signal: controller.signal });
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error("Unexpected response from sources endpoint");
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Unable to load sources");
        }

        const items = Array.isArray(data?.sources) ? data.sources : [];
        if (!cancelled) {
          setSources(items.slice(0, 6));
          setStatus("success");
        }
      } catch (err) {
        if (cancelled || (err as Error)?.name === "AbortError") return;
        setError((err as Error).message);
        setStatus("error");
      }
    };

    fetchSources();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category, language, apiKey]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
          <LanguageIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Source intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Surface trusted publishers exposed by the <strong>get_sources</strong> MCP tool.
            Filter by category and language to tailor your automations.
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {categories.map((item) => (
            <Chip
              key={item}
              label={item}
              onClick={() => setCategory(item)}
              color={category === item ? "secondary" : "default"}
              variant={category === item ? "filled" : "outlined"}
              sx={{ textTransform: "capitalize" }}
            />
          ))}
        </Stack>
        <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <TuneIcon color="action" />
          {languages.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              onClick={() => setLanguage(item.value)}
              color={language === item.value ? "secondary" : "default"}
              variant={language === item.value ? "filled" : "outlined"}
            />
          ))}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
        {status === "loading" && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Mapping sources…</Typography>
          </Stack>
        )}

        {status === "error" && error && <Alert severity="error">{error}</Alert>}

        {status === "success" && sources.length === 0 && (
          <Typography color="text.secondary">No sources available.</Typography>
        )}

        {status === "success" && sources.length > 0 && (
          <Grid container spacing={3}>
            {sources.map((source) => (
              <Grid key={source.id || source.url} size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: "background.default", color: "text.primary" }}>
                          <PublicIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {source.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {source.category} · {source.country.toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                      {source.description && (
                        <Typography variant="body2" color="text.secondary">
                          {source.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Language: {source.language.toUpperCase()}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3 }}>
                    <Button
                      component={MuiLink}
                      href={source.url}
                      target="_blank"
                      rel="noopener"
                      variant="outlined"
                    >
                      Visit site
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
          Synced with MCP clients to keep your automation gallery aligned with vetted publishers.
        </Typography>
      )}
    </Stack>
  );
}
