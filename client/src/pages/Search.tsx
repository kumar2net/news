import { Box, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/TravelExplore";
import NewsSearch from "../components/NewsSearch";

export default function Search() {
  return (
    <Stack spacing={5}>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 6 },
          background:
            "linear-gradient(135deg, rgba(14,116,144,0.16) 0%, rgba(59,130,246,0.2) 100%)",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={2} maxWidth={600}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SearchIcon color="primary" />
            <Typography variant="overline" color="text.secondary">
              Curate your take
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            Spin up a bespoke news briefing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Combine any mix of topics—from climate and AI to culture—and we will
            hydrate your feed with the freshest reporting.
          </Typography>
        </Stack>
      </Box>

      <NewsSearch />
    </Stack>
  );
}
