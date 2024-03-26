import {Inter,/*  Roboto_Mono, Montserrat, Nunito*/ } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });
/*const roboto_mono = Roboto_Mono({ subsets: ["latin"] });
const montserrat= Montserrat ({ subsets: ["latin"],})
const nunito= Nunito({ subsets: ["latin"], display: 'swap'});;*/

export const fonts = {
  inter,
  /*roboto_mono,
  montserrat,
  nunito,*/
};

export const metadata = {
  title: "Equipment",
  description: "Equipment-Loan-App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
