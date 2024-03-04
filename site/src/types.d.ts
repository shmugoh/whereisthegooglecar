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
};

type cardSetProps = {
  month: string;
  year: string;
  info: [];
  index: number;
  showCompany?: boolean;
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
