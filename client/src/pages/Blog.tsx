import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BoltIcon from "@mui/icons-material/Bolt";
import TerminalIcon from "@mui/icons-material/Terminal";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const guides = [
  {
    title: "MCP automation recipes",
    description:
      "Step-by-step walkthroughs for orchestrating NewsAPI calls, chaining prompts, and capturing structured outputs.",
    action: "Explore recipes",
    icon: <TerminalIcon />,
  },
  {
    title: "Designing AI-ready briefings",
    description:
      "Learn how to balance latency, relevance, and readability for automated digests and collaborative handoffs.",
    action: "Read playbook",
    icon: <AutoStoriesIcon />,
  },
  {
    title: "Observability and trust",
    description:
      "Instrument your proxy with metrics, retries, and alerting while communicating health to end users.",
    action: "Open guide",
    icon: <BoltIcon />,
  },
];

export default function Blog() {
  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="h3" fontWeight={700}>
          Knowledge hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Deep dives, automation recipes, and explainers to help you ship a
          future-proof newsroom. Every guide is optimized for quick scanning and
          includes ready-to-run MCP snippets.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="AI summaries" color="primary" variant="outlined" />
          <Chip label="Automation" color="secondary" variant="outlined" />
          <Chip label="Design systems" variant="outlined" />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {guides.map((guide) => (
          <Grid size={{ xs: 12, md: 4 }} key={guide.title}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip icon={guide.icon} label="Guide" color="primary" />
                <TipsAndUpdatesIcon color="secondary" />
              </Stack>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {guide.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {guide.description}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" color="primary">
                {guide.action}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, textAlign: "center" }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Want tailored tips in your inbox?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscribe to the automation digest and receive monthly updates with
            templates, UI inspiration, and MCP-compatible scripts.
          </Typography>
          <Button variant="outlined">Join the digest</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
