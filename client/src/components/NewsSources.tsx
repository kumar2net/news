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
import ApiSelector from "./ApiSelector";

const COUNTRIES = [
  { code: "ae", name: "United Arab Emirates" },
  { code: "ar", name: "Argentina" },
  { code: "at", name: "Austria" },
  { code: "au", name: "Australia" },
  { code: "be", name: "Belgium" },
  { code: "bg", name: "Bulgaria" },
  { code: "br", name: "Brazil" },
  { code: "ca", name: "Canada" },
  { code: "ch", name: "Switzerland" },
  { code: "cn", name: "China" },
  { code: "co", name: "Colombia" },
  { code: "cu", name: "Cuba" },
  { code: "cz", name: "Czech Republic" },
  { code: "de", name: "Germany" },
  { code: "eg", name: "Egypt" },
  { code: "fr", name: "France" },
  { code: "gb", name: "United Kingdom" },
  { code: "gr", name: "Greece" },
  { code: "hk", name: "Hong Kong" },
  { code: "hu", name: "Hungary" },
  { code: "id", name: "Indonesia" },
  { code: "ie", name: "Ireland" },
  { code: "il", name: "Israel" },
  { code: "in", name: "India" },
  { code: "it", name: "Italy" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "lt", name: "Lithuania" },
  { code: "lv", name: "Latvia" },
  { code: "ma", name: "Morocco" },
  { code: "mx", name: "Mexico" },
  { code: "my", name: "Malaysia" },
  { code: "ng", name: "Nigeria" },
  { code: "nl", name: "Netherlands" },
  { code: "no", name: "Norway" },
  { code: "nz", name: "New Zealand" },
  { code: "ph", name: "Philippines" },
  { code: "pl", name: "Poland" },
  { code: "pt", name: "Portugal" },
  { code: "ro", name: "Romania" },
  { code: "rs", name: "Serbia" },
  { code: "ru", name: "Russia" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "se", name: "Sweden" },
  { code: "sg", name: "Singapore" },
  { code: "si", name: "Slovenia" },
  { code: "sk", name: "Slovakia" },
  { code: "th", name: "Thailand" },
  { code: "tr", name: "Turkey" },
  { code: "tw", name: "Taiwan" },
  { code: "ua", name: "Ukraine" },
  { code: "us", name: "United States" },
  { code: "ve", name: "Venezuela" },
  { code: "za", name: "South Africa" },
];

const LANGUAGES = [
  { code: "all", name: "All languages" },
  { code: "ar", name: "Arabic" },
  { code: "de", name: "German" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "he", name: "Hebrew" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "no", name: "Norwegian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "sv", name: "Swedish" },
  { code: "ud", name: "Urdu" },
  { code: "zh", name: "Chinese" },
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

const resolveSources = (payload: unknown): unknown[] => {
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { sources?: unknown }).sources)
  ) {
    return (payload as { sources: unknown[] }).sources;
  }
  return Array.isArray(payload) ? payload : [];
};

const toDisplayString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const toOptionalDisplayString = (value: unknown) => {
  const text = toDisplayString(value).trim();
  return text.length ? text : null;
};

const sanitizeSource = (source: unknown, index: number): Source | null => {
  if (!source || typeof source !== "object") {
    return null;
  }

  const record = source as Partial<Source> & { _id?: unknown };

  const id =
    toOptionalDisplayString(record.id) ||
    toOptionalDisplayString(record._id) ||
    `source-${index}`;
  const name = toOptionalDisplayString(record.name);
  const url = toOptionalDisplayString(record.url);

  if (!name || !url) {
    return null;
  }

  const description = toOptionalDisplayString(record.description);
  const category = toOptionalDisplayString(record.category);
  const language = toOptionalDisplayString(record.language)?.toLowerCase() ?? null;
  const country = toOptionalDisplayString(record.country)?.toLowerCase() ?? null;

  return {
    id,
    name,
    description,
    url,
    category,
    language,
    country,
  } satisfies Source;
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
  const [country, setCountry] = React.useState("us");
  const [language, setLanguage] = React.useState("all");
  const [provider, setProvider] = React.useState<"auto" | "newsapi" | "newsdata">("auto");
  const [sources, setSources] = React.useState<Source[]>([]);
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [translations, setTranslations] = React.useState<
    Record<string, TranslationState>
  >({});
  const [, startSourcesTransition] = React.useTransition();

const loadSources = React.useCallback(
    async (countryCode: string, languageCode: string, controller: AbortController, selectedProvider: "auto" | "newsapi" | "newsdata" = "auto") => {
      setStatus("loading");
      setError(null);

      try {
        const params: Record<string, string> = {
          country: countryCode,
          language: languageCode,
        };
        if (selectedProvider && selectedProvider !== "auto") {
          // backend may ignore this for sources; safe to pass
          params.provider = selectedProvider;
        }
        const response = await axios.get("/api/get-sources", {
          params,
          signal: controller.signal,
        });

        const resolved = resolveSources(response.data).reduce<Source[]>(
          (acc, source, index) => {
            const sanitized = sanitizeSource(source, index);
            if (sanitized) {
              acc.push(sanitized);
            }
            return acc;
          },
          [],
        );

        startSourcesTransition(() => {
          setSources(resolved);
          setTranslations({});
          setStatus("success");
        });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        startSourcesTransition(() => {
          setStatus("error");
          setError(
            (err as Error)?.message || "Unable to fetch publishers right now.",
          );
        });
      }
    },
    [],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    loadSources(country, language, controller, provider);

    return () => controller.abort();
  }, [country, language, provider, loadSources]);

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

          <ApiSelector value={provider} onChange={setProvider} disabled={status === "loading"} />
        </Stack>

        <Divider />

        {renderContent()}
      </Stack>
    </Box>
  );
}
