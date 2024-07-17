type cardProps = {
  id: number;
  date: string;
  town: string;
  country_emoji: string;
  image: string;
  source: string;
  location?: string;
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
    country_emoji: string;
    image: string;
    source: string;
    location: string | null;
    company: string;
    width: number;
    height: number;
  };
  dateFormatted: string;
};

interface queryClause {
  date?: { gte: Date; lte: Date };
  country?: string;
  company?: { notIn: string[] } | string;
  town?: { contains: string; mode: "insensitive" };
}
