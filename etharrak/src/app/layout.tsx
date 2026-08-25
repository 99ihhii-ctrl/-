import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "اتحرك | برنامجك الرياضي في دقيقتين",
  description:
    "اتحرك يبني لك برنامج تمارين ووجبات مخصص بالذكاء الاصطناعي حسب بياناتك وهدفك.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-background font-arabic text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
