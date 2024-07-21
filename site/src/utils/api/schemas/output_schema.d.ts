/* Metadata */
// Services
interface ServiceMetadata {
  label: string;
  value: string;
}
type ServicesList = Array<ServiceMetadata>;

// Countries
interface CountryMetadata {
  label: string;
  value: string;
}
type CountriesList = Array<CountryMetadata>;

// Date Span
interface DateSpanResult {
  earliest_date: Date;
  newest_date: Date;
}

// Available Months
interface MonthMetadata {
  date: Date;
  pages: number;
  count: number;
}
type MonthList = Array<MonthMetadata>;

/* Spottings */
interface SpottingMetadata {
  id: string;
  date: string; // hono is passing prisma's date as an ISO-String
  country: string;
  country_emoji: string;
  town: string;
  service: string;
  source: string;
  location: string | null;
  image: string;
  width: number | null;
  height: number | null;
}
type SpottingsID = [SpottingMetadata]; // only for redis
type SpottingsArray = Array<SpottingMetadata>;

/* Forms */
interface presign_s3_output {
  url: string;
  key: string;
}

interface form_output {
  code: number;
  message: string;
}
