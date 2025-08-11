import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ErpFlow - Professional Business Management',
  description: 'Comprehensive ERP solution for modern businesses. Manage finance, inventory, CRM, and analytics in one unified platform.',
  keywords: 'ERP, business management, finance, inventory, CRM, analytics, invoicing, accounting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}