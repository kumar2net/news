import { Stack, Typography } from "@mui/material";
import NewsSearch from "../components/NewsSearch";
import NewsFeed from "../components/NewsFeed.jsx";

export default function Home() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h3" fontWeight={700}>
          Welcome 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Craft a personalized briefing powered by the NewsAPI MCP server. Start
          by entering a few topics below.
        </Typography>
      </Stack>

      <NewsSearch />

      <NewsFeed />
    </Stack>
  );
}
