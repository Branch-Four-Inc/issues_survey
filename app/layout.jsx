import "./globals.css";

export const metadata = {
  title: "Local Issues Survey",
  description: "Browse and vote on local community issues",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
