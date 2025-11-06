import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import WarningIcon from "@mui/icons-material/WarningAmber";
import { Link as RouterLink, isRouteErrorResponse, useRouteError } from "react-router-dom";

const getMessageFromUnknown = (error: unknown): { title: string; description: string } => {
  if (isRouteErrorResponse(error)) {
    const status = `${error.status}`;
    const statusText = error.statusText || "Unexpected error";
    const detail =
      typeof error.data === "string"
        ? error.data
        : error.data && typeof error.data === "object" && "message" in error.data
          ? String((error.data as { message?: unknown }).message ?? "")
          : "";

    return {
      title: `${status} — ${statusText}`,
      description: detail || "We couldn't load this view just now. Try refreshing.",
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      description: error.message,
    };
  }

  if (error && typeof error === "object") {
    const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
    const message =
      "message" in error ? String((error as { message?: unknown }).message ?? "") : "";

    if (code || message) {
      return {
        title: code ? `Error ${code}` : "Something went wrong",
        description: message || "We hit an unexpected issue loading this screen.",
      };
    }
  }

  return {
    title: "Something went wrong",
    description: "We couldn't load this screen. Please go back to the headlines.",
  };
};

export default function ErrorFallback() {
  const error = useRouteError();
  const { title, description } = React.useMemo(() => getMessageFromUnknown(error), [error]);

  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        px: 3,
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: 480,
          textAlign: "center",
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          p: { xs: 4, md: 6 },
          backgroundColor: "background.paper",
        }}
      >
        <Stack spacing={1} alignItems="center">
          <WarningIcon color="warning" fontSize="large" />
          <Typography variant="h5" fontWeight={700} component="h1">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button component={RouterLink} to="/" variant="contained" color="primary">
            Go to headlines
          </Button>
          <Button onClick={() => window.location.reload()} variant="outlined" color="inherit">
            Reload page
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
