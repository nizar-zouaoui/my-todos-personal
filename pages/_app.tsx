import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Navbar from "../components/ui/Navbar";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export default function App({ Component, pageProps }: AppProps) {
  const isAuthenticated = Boolean(pageProps?.isAuthenticated);
  return (
    <main className={inter.variable}>
      <Navbar isAuthenticated={isAuthenticated} />
      <Component {...pageProps} />
    </main>
  );
}
