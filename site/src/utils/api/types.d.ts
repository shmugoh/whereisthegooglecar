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

// this is returned by the https backend
interface SpottingMetadata {
  id: string;
  date: string;
  country: string;
  country_emoji: string;
  town: string;
  service: string;
  source: string;
  location: string | null;
  image: string;
  width: number;
  height: number;
}
type SpottingsID = [SpottingMetadata]; // only for redis
type SpottingsArray = Array<SpottingMetadata>;
