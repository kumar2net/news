import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import GroupsIcon from "@mui/icons-material/Groups";
import InsightsIcon from "@mui/icons-material/Insights";
import MapIcon from "@mui/icons-material/Map";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import NewsSearch, { EMPTY_BRIEFING_SUMMARY } from "../components/NewsSearch";
import TopHeadlinesPanel from "../components/TopHeadlinesPanel";
import SourceSpotlight from "../components/SourceSpotlight";
import type { BriefingSummary, Timeframe } from "../components/NewsSearch";

const timeframeOptions: { value: Timeframe; label: string; helper: string }[] = [
  { value: "today", label: "Today", helper: "Morning pulse" },
  { value: "recent", label: "Last 24 hours", helper: "Rolling window" },
  { value: "deep", label: "Deep dives", helper: "Long-form focus" },
];

export default function Home() {
  const [timeframe, setTimeframe] = React.useState<Timeframe>("today");
  const [summary, setSummary] = React.useState<BriefingSummary>(
    EMPTY_BRIEFING_SUMMARY,
  );

  return (
    <Stack spacing={5}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(82,91,255,0.28), rgba(163,73,255,0.18))"
              : "linear-gradient(135deg, rgba(82,91,255,0.12), rgba(163,73,255,0.08))",
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                width: 56,
                height: 56,
              }}
            >
              <AutoAwesomeIcon />
            </Avatar>
            <Box>
              <Typography variant="overline" color="primary.main">
                AI briefing preview
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                {summary.headline}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            {summary.subheadline}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {timeframeOptions.map((option) => (
              <Chip
                key={option.value}
                label={
                  <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption">{option.helper}</Typography>
                  </Box>
                }
                onClick={() => setTimeframe(option.value)}
                color={option.value === timeframe ? "primary" : "default"}
                variant={option.value === timeframe ? "filled" : "outlined"}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 3,
                  flexGrow: { xs: 1, sm: 0 },
                  justifyContent: "flex-start",
                }}
              />
            ))}
          </Stack>

          <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<InsightsIcon />}
              label="Sentiment balance"
              helper="Positive weighting across all fetched stories"
              value={Math.round(summary.sentiment * 100)}
              suffix="%"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<GroupsIcon />}
              label="Source diversity"
              helper="Distinct publishers contributing to your feed"
              value={summary.sourceDiversity}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              icon={<ElectricBoltIcon />}
              label="Articles tracked"
              helper={`Trend: ${summary.trend}`}
              value={summary.totalArticles}
            />
          </Grid>
          </Grid>

          <Divider light />

          <Stack spacing={1} direction={{ xs: "column", md: "row" }}>
            <Tooltip title="Launch briefing automation">
              <Chip
                icon={<PlayCircleIcon />}
                label="Trigger Daily Digest"
                color="secondary"
                sx={{ borderRadius: 3, px: 2, height: 48 }}
                clickable
              />
            </Tooltip>
            <Tooltip title="Map your MCP flows">
              <Chip
                icon={<MapIcon />}
                label="Open Automation Gallery"
                variant="outlined"
                sx={{ borderRadius: 3, px: 2, height: 48 }}
                clickable
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      <NewsSearch timeframe={timeframe} onSummaryChange={setSummary} />
      <TopHeadlinesPanel />
      <SourceSpotlight />
    </Stack>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  helper: string;
  value: number;
  suffix?: string;
}

function MetricCard({ icon, label, helper, value, suffix }: MetricCardProps) {
  const progress = Math.min(100, Math.max(0, value));

  return (
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
      <Avatar
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          width: 44,
          height: 44,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700}>
        {value}
        {suffix}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 999 }}
      />
    </Paper>
  );
}
