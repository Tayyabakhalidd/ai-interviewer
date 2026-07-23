import './globals.css';

export const metadata = {
  title: 'AI Interviewer',
  description: 'AI-powered mock interview platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
