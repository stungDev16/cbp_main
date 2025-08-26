import PopupContainer from "@/components/common/PopupContainer";
import Loading from "@/components/lazy/loading/Loading";
import LoadingProvider from "@/context/Loading/Loading.provider";
import PopupProvider from "@/context/Popup/Popup.provider";
import ThemesProvider from "@/context/Themes/Themes.provider";
import LanguageProvider from "@/context/Translation/Translation.provider";
import { UserProvider } from "@/context/user/User.provider";
import MainRouters from "@/router/routers";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

export default function App() {
  return (
    <LanguageProvider>
      <ThemesProvider>
        <UserProvider>
            <BrowserRouter>
              <LoadingProvider>
                <PopupProvider>
                  <MainRouters />
                  <PopupContainer />
                  <Loading />
                  <Toaster richColors />
                </PopupProvider>
              </LoadingProvider>
            </BrowserRouter>
        </UserProvider>
      </ThemesProvider>
    </LanguageProvider>
  );
}
