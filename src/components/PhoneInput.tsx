import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

const countries = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const PhoneInput = ({ value, onChange, required }: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<typeof countries[0] | null>(null);
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setOpen(false);
    const newValue = country.code + phoneNumber;
    onChange(newValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(num);
    if (selectedCountry) {
      onChange(selectedCountry.code + num);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm min-w-[100px] hover:bg-muted transition-colors"
        >
          {selectedCountry ? (
            <>
              <span>{selectedCountry.flag}</span>
              <span className="text-foreground">{selectedCountry.code}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Country</span>
          )}
          <ChevronDown size={14} className="ml-auto text-muted-foreground" />
        </button>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          placeholder={selectedCountry ? "Phone number" : "Select country first"}
          disabled={!selectedCountry}
          className="flex-1"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50">
          {countries.map((country) => (
            <button
              key={country.code + country.name}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
            >
              <span className="text-lg">{country.flag}</span>
              <span className="text-foreground font-medium">{country.name}</span>
              <span className="text-muted-foreground ml-auto">{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
