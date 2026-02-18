import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/components/MainView"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});

export default function TradePage() {
  return <Home />;
}
