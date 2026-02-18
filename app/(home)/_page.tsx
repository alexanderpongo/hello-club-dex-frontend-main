import dynamic from "next/dynamic";
import { memo } from "react";

// Force complete client-side rendering with loading fallback
const Home = dynamic(() => import("@/components/MainView"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});

const MainPage = memo(() => {
  return <Home />;
});


MainPage.displayName = "MainPage";

export default MainPage;
