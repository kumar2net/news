import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmailIcon from "@mui/icons-material/Email";
import LaunchIcon from "@mui/icons-material/Launch";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SchoolIcon from "@mui/icons-material/School";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const experiences = [
  {
    title: "Lead Automation Engineer",
    company: "FutureBrief Labs",
    period: "2022 — Present",
    summary:
      "Building AI-assisted newsroom tooling, MCP workflows, and resilient NewsAPI integrations across five global regions.",
  },
  {
    title: "Product Engineer",
    company: "Signal Pulse",
    period: "2019 — 2022",
    summary:
      "Launched a cross-platform briefing app with 1M+ weekly active users and pioneered accessibility-friendly dashboards.",
  },
];

const certifications = [
  "AWS Certified Solutions Architect",
  "Google Professional Cloud Developer",
  "OpenAI Applied AI Practitioner",
];

export default function Me() {
  return (
    <Stack spacing={5}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "center",
        }}
      >
        <Avatar sx={{ width: 96, height: 96, bgcolor: "primary.main" }}>
          <SmartToyIcon fontSize="large" />
        </Avatar>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Kumar2net
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Builder of contemporary news experiences, automation tinkerer, and
            advocate for transparent AI systems. I partner with editors and
            product teams to ship lovable intelligence features.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<BusinessCenterIcon />} label="Consulting" />
            <Chip icon={<MilitaryTechIcon />} label="MCP Specialist" color="secondary" />
            <Chip icon={<SchoolIcon />} label="Mentor" variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<EmailIcon />}>
              Connect
            </Button>
            <Button variant="outlined" endIcon={<LaunchIcon />}>
              View resume
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, height: "100%" }}
          >
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700}>
                Experience snapshot
              </Typography>
              <Stack spacing={3}>
                {experiences.map((experience) => (
                  <Box key={experience.title}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {experience.title} — {experience.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {experience.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {experience.summary}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, height: "100%" }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={700}>
                Certifications
              </Typography>
              {certifications.map((certification) => (
                <Chip
                  key={certification}
                  label={certification}
                  variant="outlined"
                  sx={{ justifyContent: "flex-start" }}
                />
              ))}
              <Divider flexItem sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Also exploring advanced prompt engineering, autonomous MCP
                agents, and UX for explainable AI. Reach out for collaborations
                or speaking opportunities.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
