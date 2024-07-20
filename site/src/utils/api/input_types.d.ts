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
