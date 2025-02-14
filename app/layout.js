import "./globals.css";
import { AuthProvider } from "./Context/AuthContext";

export const metadata = {
  title: "StuddyBuddy",
  description: "App from students, by students, for students",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
