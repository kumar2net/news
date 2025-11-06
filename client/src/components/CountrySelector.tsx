import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

const COUNTRIES = [
  { code: "all", label: "All countries" },
  { code: "us", label: "United States" },
  { code: "gb", label: "United Kingdom" },
  { code: "in", label: "India" },
  { code: "au", label: "Australia" },
  { code: "ca", label: "Canada" },
  // ——— More options ———
  { code: "ae", label: "UAE" },
  { code: "ar", label: "Argentina" },
  { code: "at", label: "Austria" },
  { code: "be", label: "Belgium" },
  { code: "bg", label: "Bulgaria" },
  { code: "br", label: "Brazil" },
  { code: "ch", label: "Switzerland" },
  { code: "cn", label: "China" },
  { code: "co", label: "Colombia" },
  { code: "cu", label: "Cuba" },
  { code: "cz", label: "Czechia" },
  { code: "de", label: "Germany" },
  { code: "eg", label: "Egypt" },
  { code: "fr", label: "France" },
  { code: "gr", label: "Greece" },
  { code: "hk", label: "Hong Kong" },
  { code: "hu", label: "Hungary" },
  { code: "id", label: "Indonesia" },
  { code: "ie", label: "Ireland" },
  { code: "il", label: "Israel" },
  { code: "it", label: "Italy" },
  { code: "jp", label: "Japan" },
  { code: "kr", label: "S. Korea" },
  { code: "lt", label: "Lithuania" },
  { code: "lv", label: "Latvia" },
  { code: "ma", label: "Morocco" },
  { code: "mx", label: "Mexico" },
  { code: "my", label: "Malaysia" },
  { code: "ng", label: "Nigeria" },
  { code: "nl", label: "Netherlands" },
  { code: "no", label: "Norway" },
  { code: "nz", label: "New Zealand" },
  { code: "ph", label: "Philippines" },
  { code: "pl", label: "Poland" },
  { code: "pt", label: "Portugal" },
  { code: "ro", label: "Romania" },
  { code: "rs", label: "Serbia" },
  { code: "ru", label: "Russia" },
  { code: "sa", label: "Saudi Arabia" },
  { code: "se", label: "Sweden" },
  { code: "sg", label: "Singapore" },
  { code: "si", label: "Slovenia" },
  { code: "sk", label: "Slovakia" },
  { code: "th", label: "Thailand" },
  { code: "tr", label: "Turkey" },
  { code: "tw", label: "Taiwan" },
  { code: "ua", label: "Ukraine" },
  { code: "ve", label: "Venezuela" },
  { code: "za", label: "S. Africa" },
];

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  disabled?: boolean;
}

export default function CountrySelector({
  value,
  onChange,
  disabled = false,
}: CountrySelectorProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value as string;
    if (newValue) onChange(newValue);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
      <InputLabel id="country-select-label">Country</InputLabel>
      <Select
        labelId="country-select-label"
        value={value}
        label="Country"
        onChange={handleChange}
      >
        {COUNTRIES.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
