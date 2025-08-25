interface Location {
  hash: string;
  pathname: string;
  search: string;
}

export default interface DefaultProps {
  location: Location;
  lang: string;
  searchParams: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  notFound: (error: string) => void;
}
