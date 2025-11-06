import { Box, Chip, Stack, Typography } from "@mui/material";
import NewsFeed from "../components/NewsFeed.jsx";

export default function Headlines() {
  return (
    <Stack spacing={5}>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 3, md: 5 },
          py: { xs: 5, md: 7 },
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.14) 0%, rgba(236,72,153,0.18) 100%)",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={2} maxWidth={600}>
          <Chip
            label="Global News"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ letterSpacing: "-0.02em" }}
          >
            Political headlines from around the world
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse top headlines from 50+ countries around the world.
            Note: Most sources are in English due to API limitations.
            Translate any article with one tap.
          </Typography>
        </Stack>
      </Box>

      <NewsFeed />
    </Stack>
  );
}
