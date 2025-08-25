import useLanguage from "@/context/Translation/hooks/useLanguage";
import useAuth from "@/hooks/useAuth";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

export const useRouteProps = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const auth = useAuth();
  const lang = useLanguage();

  return {
    location: {
      hash: location.hash,
      pathname: location.pathname,
      search: location.search,
    },
    lang,
    searchParams: Object.fromEntries(searchParams.entries()),
    params,
    ...auth,
  };
};
