import type { Metadata } from "next";
import "./globals.scss";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";

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
            {/* Critical Inline CSS to prevent FOUC / Shaking */}
            <style dangerouslySetInnerHTML={{ __html: `
                html, body { 
                    margin: 0; 
                    background-color: #1a1a1a; 
                    overflow: hidden;
                    height: 100%;
                }
                .page-loader-overlay {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background-color: #1a1a1a !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    z-index: 99999 !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                .loader-content {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }
                .loader-logo {
                    font-family: sans-serif;
                    font-size: 2.5rem;
                    color: #ff6b6b;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    font-weight: 700;
                    margin: 0;
                }
                .loader-spinner {
                    width: 60px;
                    height: 60px;
                    border: 5px solid rgba(255, 255, 255, 0.1);
                    border-top: 5px solid #ff6b6b;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        </head>
      <body>
        <PageLoader />
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
                <Header />
                {children}
                <Footer />
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
