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
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import TranslateIcon from "@mui/icons-material/GTranslate";

const COUNTRIES = [
  { code: "ir", name: "Iran" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "jp", name: "Japan" },
  { code: "in", name: "India" },
  { code: "ca", name: "Canada" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "qa", name: "Qatar" },
];

const LANGUAGES = [
  { code: "all", name: "All languages" },
  { code: "en", name: "English" },
  { code: "fa", name: "Persian" },
  { code: "ar", name: "Arabic" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
];

interface Source {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category?: string | null;
  language?: string | null;
  country?: string | null;
}

const resolveSources = (payload: unknown) => {
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { sources?: unknown }).sources)
  ) {
    return (payload as { sources: Source[] }).sources;
  }
  return Array.isArray(payload) ? (payload as Source[]) : [];
};

interface TranslationState {
  status: "idle" | "loading" | "success" | "error";
  text?: string | null;
  error?: string | null;
}

const initialTranslationState: TranslationState = {
  status: "idle",
  text: null,
  error: null,
};

export default function NewsSources() {
  const [country, setCountry] = React.useState("ir");
  const [language, setLanguage] = React.useState("all");
  const [sources, setSources] = React.useState<Source[]>([]);
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [translations, setTranslations] = React.useState<
    Record<string, TranslationState>
  >({});

  const loadSources = React.useCallback(
    async (countryCode: string, languageCode: string, controller: AbortController) => {
      setStatus("loading");
      setError(null);

      try {
        const response = await axios.get("/api/get-sources", {
          params: {
            country: countryCode,
            language: languageCode,
          },
          signal: controller.signal,
        });

        const resolved = resolveSources(response.data);
        setSources(resolved);
        setTranslations({});
        setStatus("success");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setStatus("error");
        setError(
          (err as Error)?.message || "Unable to fetch publishers right now.",
        );
      }
    },
    [],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    loadSources(country, language, controller);

    return () => controller.abort();
  }, [country, language, loadSources]);

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    setCountry(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value);
  };

  const handleTranslate = async (source: Source) => {
    if (!source.description) return;

    setTranslations((current) => ({
      ...current,
      [source.id]: { status: "loading", text: null, error: null },
    }));

    try {
      const response = await axios.post("/api/translate", {
        texts: [source.description],
      });
      const translated = Array.isArray(response.data?.translations)
        ? response.data.translations[0]
        : null;

      setTranslations((current) => ({
        ...current,
        [source.id]: {
          status: "success",
          text: translated || source.description,
          error: null,
        },
      }));
    } catch (err) {
      setTranslations((current) => ({
        ...current,
        [source.id]: {
          status: "error",
          text: null,
          error:
            (err as Error)?.message || "Unable to translate this description.",
        },
      }));
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress size={32} />
          <Typography color="text.secondary">
            Mapping trusted publishers…
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

    if (!sources.length) {
      return (
        <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            No sources yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try another country or language combo.
          </Typography>
        </Stack>
      );
    }

    return (
      <Grid container spacing={3}>
        {sources.map((source) => {
          const translationState = translations[source.id] || initialTranslationState;
          const showTranslateButton =
            Boolean(source.description) && source.language?.toLowerCase() !== "en";
          const translatedDescription = translationState.text;
          const isTranslated =
            translatedDescription &&
            source.description &&
            translatedDescription !== source.description;

          return (
            <Grid key={source.id || source.url} size={{ xs: 12, md: 6 }}>
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
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={700}>
                        {source.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {source.country && (
                          <Chip
                            size="small"
                            label={source.country.toUpperCase()}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {source.language && (
                          <Chip
                            size="small"
                            label={source.language.toUpperCase()}
                            variant="outlined"
                          />
                        )}
                        {source.category && (
                          <Chip
                            size="small"
                            label={source.category}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>

                    {source.description && (
                      <Typography variant="body2" color="text.secondary">
                        {source.description}
                      </Typography>
                    )}

                    {translationState.status === "success" && (
                      <Stack spacing={0.5}>
                        <Divider flexItem sx={{ borderStyle: "dashed" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: 0.4 }}
                        >
                          {isTranslated
                            ? "English translation"
                            : "Description is already English"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {translatedDescription}
                        </Typography>
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

                <CardActions sx={{ px: 3, py: 2 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ width: "100%" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      href={source.url}
                      target="_blank"
                      rel="noopener"
                      fullWidth
                    >
                      Visit site
                    </Button>
                    {showTranslateButton && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<TranslateIcon fontSize="small" />}
                        onClick={() => handleTranslate(source)}
                        disabled={translationState.status === "loading"}
                        fullWidth
                      >
                        {translationState.status === "loading"
                          ? "Translating…"
                          : "Translate"}
                      </Button>
                    )}
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
            Source radar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Filter by country and language to spotlight publishers. Translate
            descriptions instantly when a source posts in another language.
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ flexWrap: "wrap" }}
        >
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              labelId="country-label"
              value={country}
              label="Country"
              onChange={handleCountryChange}
            >
              {COUNTRIES.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="language-label">Language</InputLabel>
            <Select
              labelId="language-label"
              value={language}
              label="Language"
              onChange={handleLanguageChange}
            >
              {LANGUAGES.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider />

        {renderContent()}
      </Stack>
    </Box>
  );
}
