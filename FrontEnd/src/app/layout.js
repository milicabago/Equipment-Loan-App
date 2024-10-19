import {Inter} from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const fonts = {
  inter,
};

export const metadata = {
  title: "Equipment",
  description: "Equipment-Loan-App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <Toaster
                            position="top-center"
                            reverseOrder={false}
                            /></body>
    </html>
  );
}
