import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySync - Personalized Learning Paths",
  description: "Generate a custom study plan for any exam in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
