// import Footer from "@layout/footer/Footer.tsx";
// import Header from "@layout/header/Header.tsx";
import type DefaultProps from "@type/pages/defaultProps.interface.ts";
import { useEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import flatMap from "./_utils/flatMap.ts";
import AuthRoute from "./auth/AuthRoute.tsx";
import authRoutesMap from "./auth/config.ts";
import errorsRoutesMap from "./errors/config.ts";
import privateRoutesMap from "./private/config.ts";
import PrivateRoute from "./private/PrivateRoute.tsx";
import publicRoutesMap from "./public/config.ts";
// import withoutLayoutRoutesMap from "./withoutLayout/config.ts";
import type { RoutesMapInterface } from "@/router/interface/routesMap.interface.ts";
import useLanguage from "@/context/Translation/hooks/useLanguage.tsx";
import useNavigate from "@/hooks/useNavigate.tsx";
import { useUser } from "@/context/user/hooks/useUser.ts";

export const MainRouters = ({ ...props }) => {
  const { isAuth } = useUser();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const defaultProps: DefaultProps = {
    location: {
      hash: location.hash,
      pathname: location.pathname,
      search: location.search,
    },
    lang: String(lang),
    searchParams: Object.fromEntries(searchParams.entries()),
    params,
    notFound: (error) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        navigate("/404?code=" + error);
      }, [error]);
    },
    ...props,
  };

  // const isWithoutLayout = flatMap(withoutLayoutRoutesMap).some(
  //   (route) => route.link === location.pathname
  // );

  const renderRouteElement = (route: RoutesMapInterface) => {
    const Element = route.Element;
    if (route.Layout) {
      const Layout = route.Layout;
      return (
        <Layout {...defaultProps}>
          <Element {...defaultProps} />
        </Layout>
      );
    } else {
      return <Element {...defaultProps} />;
    }
  };

  return (
    <>
      {/* {!isWithoutLayout && <Header />} */}
      <main>
        <Routes>
          {flatMap(publicRoutesMap)?.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={renderRouteElement(route)}
            />
          ))}
          {flatMap(authRoutesMap)?.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={
                <AuthRoute auth={{ isAuthenticated: isAuth }}>
                  {renderRouteElement(route)}
                </AuthRoute>
              }
            />
          ))}
          {flatMap(privateRoutesMap)?.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={
                <PrivateRoute auth={{ isAuthenticated: isAuth }}>
                  {renderRouteElement(route)}
                </PrivateRoute>
              }
            />
          ))}
          {flatMap(errorsRoutesMap)?.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={renderRouteElement(route)}
            />
          ))}
          {/* {flatMap(withoutLayoutRoutesMap)?.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={renderRouteElement(route)}
            />
          ))} */}
        </Routes>
      </main>
      {/* {!isWithoutLayout && <Footer />} */}
    </>
  );
};

export default MainRouters;
