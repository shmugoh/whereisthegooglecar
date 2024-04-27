type cardProps = {
  id: number;
  message_id: string;
  date: string;
  town: string;
  countryEmoji: string;
  imageUrl: string;
  sourceUrl: string;
  locationUrl?: string;
  company?: string;
  width: number;
  height: number;
};

type cardSetProps = {
  month: number;
  year: string;
  info: never[];
  showCompany?: boolean;
  showSkeleton?: boolean;
};

type pageProps = {
  data: {
    id: number;
    date: string;
    town: string;
    country: string;
    countryEmoji: string;
    imageUrl: string;
    sourceUrl: string;
    locationUrl: string | null;
    company: string;
    createdAt: string;
    updatedAt: string;
    message_id: string;
    channel_id: string;
  };
  dateFormatted: string;
};
