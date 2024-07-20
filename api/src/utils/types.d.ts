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
  date: Date;
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

/* Input - Forms */
interface presignS3 {
  cf_turnstile_token: string;
  checksum: string;
  fileType: string;
  fileSize: number;
}

interface FormSchema {
  country: string;
  town: string;
  source: string;
  location?: string; // URL or empty string
  date: Date;
  service?: string; // Defaults to "Others" if not provided
  cf_turnstile_token: string;

  // new only
  image?: string; // URL

  // edit only
  id?: string;
}

/* Output - Forms */
interface presign_s3_output {
  url: string;
  key: string;
}

interface form_output {
  code: number;
  message: string;
}
