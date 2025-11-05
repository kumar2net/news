import { Box, Stack, Typography } from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import NewsSources from "../components/NewsSources";

export default function Sources() {
  return (
    <Stack spacing={5}>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 6 },
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.16) 0%, rgba(244,114,182,0.16) 100%)",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={2} maxWidth={640}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <RadarIcon color="secondary" />
            <Typography variant="overline" color="text.secondary">
              Source intelligence
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            Spot fresh voices and keep bias in check
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Jump between domestic and global outlets and instantly translate
            their bios so you know exactly who is shaping the narrative.
          </Typography>
        </Stack>
      </Box>

      <NewsSources />
    </Stack>
  );
}
