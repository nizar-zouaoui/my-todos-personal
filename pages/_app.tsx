import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Navbar from "../components/ui/Navbar";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

export default function App({ Component, pageProps }: AppProps) {
  const isAuthenticated = Boolean(pageProps?.isAuthenticated);
  return (
    <ConvexProvider client={convex}>
      <main className={inter.variable}>
        <Navbar isAuthenticated={isAuthenticated} />
        <Component {...pageProps} />
      </main>
    </ConvexProvider>
  );
}
