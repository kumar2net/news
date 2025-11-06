import * as React from "react";
import axios from "axios";
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
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PerspectiveToggle from "./PerspectiveToggle";

const toDisplayString = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const toOptionalDisplayString = (value) => {
  const text = toDisplayString(value).trim();
  return text.length ? text : null;
};

const sanitizeTranslations = (translations) => {
  if (!translations || typeof translations !== "object") {
    return undefined;
  }

  const en = translations.en;
  if (!en || typeof en !== "object") {
    return undefined;
  }

  const title = toOptionalDisplayString(en.title);
  const description = toOptionalDisplayString(en.description);

  if (!title && !description) {
    return undefined;
  }

  return {
    en: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  };
};

const sanitizeArticle = (article) => {
  if (!article || typeof article !== "object") {
    return null;
  }

  const title = toOptionalDisplayString(article.title);
  const url = toOptionalDisplayString(article.url);

  if (!title || !url) {
    return null;
  }

  const description = toOptionalDisplayString(article.description);
  const sourceName = toOptionalDisplayString(article.source?.name);

  const countryCode = toOptionalDisplayString(article.country)?.toLowerCase() ?? null;
  const originTag = toOptionalDisplayString(article.origin)?.toLowerCase() ?? null;

  const normalizedOrigin =
    originTag === "ir" || originTag === "global" ? originTag : null;

  const translations = sanitizeTranslations(article.translations);

  return {
    title,
    description,
    url,
    source: { name: sourceName || "Unknown source" },
    country: countryCode,
    origin: normalizedOrigin,
    ...(translations ? { translations } : {}),
  };
};

const normalizeErrorMessage = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    if (typeof value.message === "string" && value.message.length) {
      if (typeof value.code === "string" && value.code.length) {
        return `${value.code.toUpperCase()}: ${value.message}`;
      }
      return value.message;
    }

    try {
      return JSON.stringify(value);
    } catch (error) {
      return "An unexpected error occurred.";
    }
  }

  try {
    return String(value);
  } catch (error) {
    return "An unexpected error occurred.";
  }
};

const ORIGIN_META = {
  ir: { label: "IR", color: "secondary" },
  global: { label: "Global", color: "default" },
};

const emptyStateCopy = {
  ir: "No domestic stories were returned.",
  global: "No international stories were returned.",
  mixed: "No political stories were found right now.",
};

const statusCopy = {
  heading: "Origin pulse",
  description:
    "Jump between domestic, global, or mixed voices to feel the geopolitical temperature in seconds.",
};

const resolveArticles = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.articles)) return payload.articles;
  return [];
};

export default function NewsFeed() {
  const [originCountry, setOriginCountry] = React.useState("mixed");
  const [articles, setArticles] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState(null);
  const [, startArticlesTransition] = React.useTransition();
  const [, startPerspectiveTransition] = React.useTransition();

  const loadArticles = React.useCallback(async (origin, controller) => {
    setStatus("loading");
    setError(null);

    try {
      const response = await axios.get("/api/news", {
        params: {
          topic: "politics",
          originCountry: origin,
        },
        signal: controller.signal,
      });

      const resolved = resolveArticles(response.data)
        .map(sanitizeArticle)
        .filter(Boolean);

      startArticlesTransition(() => {
        setArticles(resolved);
        setStatus("success");
      });
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      const responseError = err?.response?.data?.error;
      const normalizedMessage =
        normalizeErrorMessage(responseError) ||
        normalizeErrorMessage(err?.message) ||
        "Unable to load political coverage.";

      startArticlesTransition(() => {
        setError(normalizedMessage);
        setStatus("error");
      });
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadArticles(originCountry, controller);

    return () => controller.abort();
  }, [originCountry, loadArticles]);

  const handlePerspectiveChange = (value) => {
    if (value === originCountry) return;
    startPerspectiveTransition(() => {
      setOriginCountry(value);
    });
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress size={36} />
          <Typography color="text.secondary">
            Gathering the latest briefings…
          </Typography>
        </Stack>
      );
    }

    if (status === "error") {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {(typeof error === "string" && error) || "Something went wrong."}
        </Alert>
      );
    }

    if (!articles.length) {
      return (
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ py: 6, color: "text.secondary", textAlign: "center" }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Nothing to share yet
          </Typography>
          <Typography variant="body2">
            {emptyStateCopy[originCountry]}
          </Typography>
        </Stack>
      );
    }

    return (
      <Grid container spacing={3}>
        {articles.map((article) => {
          const originTag = article.origin ?? null;
          const chipConfig = originTag
            ? {
                ...ORIGIN_META[originTag],
                label:
                  originTag === "ir"
                    ? "IR"
                    : (article.country || "Global").toUpperCase(),
              }
            : null;
          const englishTranslations = article.translations?.en ?? null;
          const translatedTitle = englishTranslations?.title;
          const translatedDescription = englishTranslations?.description;
          const showTranslation =
            (translatedTitle && translatedTitle !== article.title) ||
            (translatedDescription &&
              translatedDescription !== article.description);

          return (
            <Grid key={article.url} size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Stack spacing={1}>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ letterSpacing: 0.6 }}
                      >
                        {article.source?.name || "Unknown source"}
                      </Typography>
                      <Typography variant="h6" component="h3">
                        {article.title}
                      </Typography>
                    </Stack>

                    {article.description && (
                      <Typography variant="body2" color="text.secondary">
                        {article.description}
                      </Typography>
                    )}
                    {showTranslation && (
                      <Stack spacing={0.25}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: 0.4 }}
                        >
                          English translation
                        </Typography>
                        {translatedTitle && translatedTitle !== article.title && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic" }}
                          >
                            {translatedTitle}
                          </Typography>
                        )}
                        {translatedDescription &&
                          translatedDescription !== article.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              {translatedDescription}
                            </Typography>
                          )}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>

                <Divider sx={{ mx: 3 }} />

                <CardActions sx={{ px: 3, py: 2, pt: 2.5 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ width: "100%" }}
                  >
                    {chipConfig && (
                      <Chip
                        label={chipConfig.label}
                        size="small"
                        color={chipConfig.color}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}

                    <Button
                      component={MuiLink}
                      href={article.url}
                      target="_blank"
                      rel="noopener"
                      variant="contained"
                    >
                      Read more
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        px: { xs: 3, md: 4 },
        py: { xs: 3, md: 4 },
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Typography variant="h4" fontWeight={700}>
            {statusCopy.heading}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {statusCopy.description}
          </Typography>
        </Stack>

        <PerspectiveToggle
          value={originCountry}
          onChange={handlePerspectiveChange}
          disabled={status === "loading"}
        />

        <Divider />

        {renderContent()}
      </Stack>
    </Box>
  );
}
