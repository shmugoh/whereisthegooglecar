type cardProps = {
  id: number;
  date: Date;
  town: string;
  countryEmoji: string;
  imageUrl: string;
  sourceUrl: string;
  locationUrl?: string;
};

type cardSetProps = {
  month: string;
  year: string;
  info: [];
  index: number;
};
