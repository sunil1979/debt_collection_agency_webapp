import './globals.css';
import AppShell from './components/AppShell';

export const metadata = {
  title: 'Debt Collection Agency',
  description: 'A web application for a debt collection agency.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}