import type { Metadata } from "next";
import "./globals.scss";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TakeOff Restaurant",
  description: "Pizza-Service, thailändische, italienische und indische Spezialitäten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <head>
            {/* Fonts are imported in globals.scss or can be here. Using next/font is better but user had google fonts links. 
                I added imports in globals.scss. */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
                {children}
                <Footer />
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
