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

      const resolved = resolveArticles(response.data);
      setArticles(resolved);
      setStatus("success");
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load political coverage.";
      setError(message);
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadArticles(originCountry, controller);

    return () => controller.abort();
  }, [originCountry, loadArticles]);

  const handlePerspectiveChange = (value) => {
    setOriginCountry(value);
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
          {error || "Something went wrong."}
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

        <PerspectiveToggle value={originCountry} onChange={handlePerspectiveChange} />

        <Divider />

        {renderContent()}
      </Stack>
    </Box>
  );
}
