import "./globals.css";
import { AuthProvider } from "./Context/AuthContext";

export const metadata = {
  title: "StudyBuddy",
  description: "App from students, by students, for students",
  keywords: ["StudyBuddy", "Student App", "Education", "Learning", "Study"],
  icons: {
    icon: "/images/favicon.svg",
  }
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="select-none">{children}</body>
      </html>
    </AuthProvider>
  );
}
