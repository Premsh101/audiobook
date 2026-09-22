import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hush. — Stories, closer.",
  description: "A global-first audiobook library with a Favourite Voice experience.",
  metadataBase: new URL("https://hush.example.com"),
  themeColor: "#f5f0e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
