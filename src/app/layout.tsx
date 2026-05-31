import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LangProvider } from "@/context/LangContext";
import { MenuProvider } from "@/context/MenuContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OUMI ROLL — Restaurant Sushi Le Mans",
  description: "Commandez vos sushis et makis en ligne. Livraison et à emporter à Le Mans.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <LangProvider>
          <AuthProvider>
            <MenuProvider>
              <CartProvider>
                <Header />
                <main className="flex-1 pt-[72px]">{children}</main>
                <CartDrawer />
              </CartProvider>
            </MenuProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
