import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RankedEDHK - JUPAS Program Reviews',
  description: 'A platform for verified HK university students to review JUPAS programs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <main>{children}</main>
      </body>
    </html>
  );
}
