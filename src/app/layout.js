import "./globals.css";
import { Urbanist } from 'next/font/google'

const inter = Urbanist({ subsets: ['latin'] })

export const metadata = {
  title: "Rescue Zone | DVBS 2024",
  description: "Just another project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} >{children}</body>
    </html>
  );
}
