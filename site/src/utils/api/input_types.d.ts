interface SearchInput {
  month: number;
  year: number;
  page: number;
  service?: string;
  town?: string;
  country?: string;

  cache?: boolean;
}

interface SearchMonthInput {
  service?: string; // might not be parsed
  town?: string;
  country?: string;
  cache?: boolean;
}
