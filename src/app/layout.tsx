import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FirebaseProvider } from './contexts/FirebaseContext';

export const metadata: Metadata = {
  title: "Cal Fitness Student Dashboard",
  description: "Easy integration with cal RSF events and fitness tracking for students. - by MJROBILLARD",
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🐻</text></svg>',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Analytics />
      </body>
    </html>
  );
}
