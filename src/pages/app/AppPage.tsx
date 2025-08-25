import TabSection from "../proxies/section/tab/TabSection";
import AppSection from "./section/AppSection";

export default function AppPage() {
  return (
    <div className="mx-auto flex flex-col h-full w-full ">
      <TabSection />
      <AppSection />
    </div>
  );
}
