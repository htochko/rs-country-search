export interface Country {
  name: string;
  capital?: string | string[];
  region: string;
  population: number;
  flags: {
    svg: string;
    png: string;
  };
  languages: Record<string, string> | string[];
  currencies: Record<string, { name: string; symbol: string }> | string[];
}

export interface CountryOutput {
  name: string;
  capital: string;
  flagUrl: string;
  population: number;
}
