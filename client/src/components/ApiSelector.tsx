import { FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";

export type NewsProvider = "auto" | "newsapi" | "newsdata";

interface ApiSelectorProps {
  value: NewsProvider;
  onChange: (provider: NewsProvider) => void;
  disabled?: boolean;
}

export default function ApiSelector({ value, onChange, disabled = false }: ApiSelectorProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
      <InputLabel id="api-select-label">API Provider</InputLabel>
      <Select
        labelId="api-select-label"
        value={value}
        label="API Provider"
        onChange={(e) => onChange(e.target.value as NewsProvider)}
      >
        <MenuItem value="auto">
          <Tooltip title="Use the server default (can be configured)">
            <span>Auto (server default)</span>
          </Tooltip>
        </MenuItem>
        <MenuItem value="newsapi">NewsAPI</MenuItem>
        <MenuItem value="newsdata">NewsData.io</MenuItem>
      </Select>
    </FormControl>
  );
}