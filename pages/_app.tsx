import { Metadata } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "My Todos Personal - A cozy planner for your everyday lists",
  description: "A cozy planner for your everyday lists",
};

export default function App({ Component, pageProps }: AppProps) {
  const isAuthenticated = Boolean(pageProps?.isAuthenticated);
  return (
    <main className={inter.variable}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar isAuthenticated={isAuthenticated} />
      <Component {...pageProps} />
    </main>
  );
}
