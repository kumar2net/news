import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const COUNTRIES = [
  { code: "all", label: "All" },
  { code: "ae", label: "UAE" },
  { code: "ar", label: "Argentina" },
  { code: "at", label: "Austria" },
  { code: "au", label: "Australia" },
  { code: "be", label: "Belgium" },
  { code: "bg", label: "Bulgaria" },
  { code: "br", label: "Brazil" },
  { code: "ca", label: "Canada" },
  { code: "ch", label: "Switzerland" },
  { code: "cn", label: "China" },
  { code: "co", label: "Colombia" },
  { code: "cu", label: "Cuba" },
  { code: "cz", label: "Czechia" },
  { code: "de", label: "Germany" },
  { code: "eg", label: "Egypt" },
  { code: "fr", label: "France" },
  { code: "gb", label: "UK" },
  { code: "gr", label: "Greece" },
  { code: "hk", label: "Hong Kong" },
  { code: "hu", label: "Hungary" },
  { code: "id", label: "Indonesia" },
  { code: "ie", label: "Ireland" },
  { code: "il", label: "Israel" },
  { code: "in", label: "India" },
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
  { code: "us", label: "US" },
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
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      disabled={disabled}
      sx={{
        flexWrap: "wrap",
        gap: 1,
        "& .MuiToggleButton-root": {
          px: 2,
          py: 1,
          border: 1,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          },
        },
      }}
    >
      {COUNTRIES.map((country) => (
        <ToggleButton key={country.code} value={country.code}>
          {country.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
