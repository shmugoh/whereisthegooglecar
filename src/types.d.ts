type cardProps = {
  id: number;
  date: string;
  town: string;
  countryEmoji: string;
  imageUrl: string;
  sourceUrl: string;
  locationUrl?: string;
};

type cardSetProps = {
  month: string;
  year: string;
  info: cardProps[];
};
