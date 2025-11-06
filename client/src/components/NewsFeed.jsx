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
  IconButton,
  Link as MuiLink,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TranslateIcon from "@mui/icons-material/GTranslate";
import CountrySelector from "./CountrySelector";

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

  return {
    title,
    description,
    url,
    source: { name: sourceName || "Unknown source" },
    country: countryCode,
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

const statusCopy = {
  heading: "Country Selection",
  description:
    "Browse top headlines from around the world. Select a country to see news from that region, or view all countries together. Note: Most sources are in English.",
};

const resolveArticles = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.articles)) return payload.articles;
  return [];
};

export default function NewsFeed() {
  const [country, setCountry] = React.useState("all");
  const [articles, setArticles] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState(null);
  const [translations, setTranslations] = React.useState({});
  const [, startArticlesTransition] = React.useTransition();
  const [, startCountryTransition] = React.useTransition();

  const loadArticles = React.useCallback(async (countryCode, controller) => {
    setStatus("loading");
    setError(null);

    try {
      const response = await axios.get("/api/news", {
        params: {
          country: countryCode,
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
    loadArticles(country, controller);

    return () => controller.abort();
  }, [country, loadArticles]);

  const handleCountryChange = (value) => {
    if (value === country) return;
    startCountryTransition(() => {
      setCountry(value);
      setTranslations({});
    });
  };

  const handleTranslate = async (article) => {
    const key = article.url;
    setTranslations((current) => ({
      ...current,
      [key]: { status: "loading", title: null, description: null },
    }));

    try {
      const textsToTranslate = [article.title];
      if (article.description) {
        textsToTranslate.push(article.description);
      }

      const response = await axios.post("/api/translate", {
        texts: textsToTranslate,
      });

      const translated = response.data?.translations || [];
      setTranslations((current) => ({
        ...current,
        [key]: {
          status: "success",
          title: translated[0] || article.title,
          description: translated[1] || article.description,
        },
      }));
    } catch (err) {
      setTranslations((current) => ({
        ...current,
        [key]: {
          status: "error",
          error: "Translation failed",
        },
      }));
    }
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
            No articles found
          </Typography>
          <Typography variant="body2">
            No political stories were found for the selected country.
          </Typography>
        </Stack>
      );
    }

    return (
      <Grid container spacing={3}>
        {articles.map((article) => {
          const countryLabel = article.country ? article.country.toUpperCase() : "Unknown";
          const translationState = translations[article.url] || {};
          const showTranslation = translationState.status === "success";
          const translatedTitle = translationState.title;
          const translatedDescription = translationState.description;
          const hasTranslation =
            (translatedTitle && translatedTitle !== article.title) ||
            (translatedDescription && translatedDescription !== article.description);

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
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ letterSpacing: 0.6 }}
                        >
                          {article.source?.name || "Unknown source"}
                        </Typography>
                        <Tooltip title="Translate to English">
                          <IconButton
                            size="small"
                            onClick={() => handleTranslate(article)}
                            disabled={translationState.status === "loading"}
                            color={showTranslation ? "primary" : "default"}
                          >
                            <TranslateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Typography variant="h6" component="h3">
                        {article.title}
                      </Typography>
                    </Stack>

                    {article.description && (
                      <Typography variant="body2" color="text.secondary">
                        {article.description}
                      </Typography>
                    )}

                    {showTranslation && hasTranslation && (
                      <Stack spacing={0.5}>
                        <Divider flexItem sx={{ borderStyle: "dashed" }} />
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ letterSpacing: 0.4, fontWeight: 600 }}
                        >
                          English Translation
                        </Typography>
                        {translatedTitle && translatedTitle !== article.title && (
                          <Typography variant="h6" component="h3" sx={{ fontStyle: "italic" }}>
                            {translatedTitle}
                          </Typography>
                        )}
                        {translatedDescription && translatedDescription !== article.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            {translatedDescription}
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {translationState.status === "error" && (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        {translationState.error}
                      </Alert>
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
                    <Chip
                      label={countryLabel}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />

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

        <CountrySelector
          value={country}
          onChange={handleCountryChange}
          disabled={status === "loading"}
        />

        <Divider />

        {renderContent()}
      </Stack>
    </Box>
  );
}
