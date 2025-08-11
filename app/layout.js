import { inter } from "@/app/ui/font"
import { NavbarDemo } from "@/app/ui/navbar";
import Footer from "@/components/footer";
import UserSync from "@/components/user-sync";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'


export const metadata = {
  title: {
    template: '%s | QUICKCOURT',
    default: 'QUICKCOURT',
  },
  description: 'Easily manage your sports venue booking with QUICKCOURT.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        }
      }}
    >
      <html lang="en">
        <body className={`${inter.className} antialiased  `}>
          <div id="clerk-captcha" style={{display: 'none'}}></div>
          
          <UserSync />
          
          <NavbarDemo />

          <main className="min-h-screen   ">
            {children}
          </main>
          {/* footer */}
          <Footer />

        </body>
      </html>
    </ClerkProvider>
  );
}
      