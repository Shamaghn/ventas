
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen w-full bg-gray-50">
        {children}
      </body>
    </html>
  );
}