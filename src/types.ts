export interface Country {
  name: string;
  capital: string;
  region: string;
  population: number;
  flags: {
    svg: string;
    png: string;
  };
  languages: Record<string, string> | string[];
  currencies: Record<string, { name: string; symbol: string }> | string[];
}
