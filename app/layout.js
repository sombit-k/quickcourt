import { inter } from "@/app/ui/font"
import { NavbarDemo } from "@/app/ui/navbar";
// import Footer from "@/components/footer";
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
  description: 'Easily manage your sports booking with QUICKCOURT.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased  `}>
          <UserSync />
          
          <NavbarDemo />

          <main className="min-h-screen   ">
            {children}
          </main>
          footer
          {/* <Footer /> */}

        </body>
      </html>
    </ClerkProvider>
  );
}
      