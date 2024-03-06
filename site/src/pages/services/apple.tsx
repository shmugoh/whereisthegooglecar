import EntriesPage from "~/components/layout/entry/entries";

export default function Home() {
  return <EntriesPage company="Apple" showCompany={true} maxYear={2015} />;
}
