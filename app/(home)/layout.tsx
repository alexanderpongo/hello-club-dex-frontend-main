import { Lato, Barlow_Condensed } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "react-toastify/dist/ReactToastify.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-barlow-condensed",
});

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${lato.variable} ${barlow.variable}`}>
      <div className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-dark/30 dark:from-black">
        <div className="container">
          <Navbar />
        </div>
      </div>
      <main className="min-h-[calc(100vh-175px-62px)] md:min-h-[calc(100vh-280px-67px)]">
        {children}
      </main>
      <div className="dark:bg-black mt-20">
        <div className="container mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
