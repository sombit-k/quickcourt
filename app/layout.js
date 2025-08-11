import { inter } from "@/app/ui/font"
import { NavbarDemo } from "@/app/ui/navbar";
// import Footer from "@/components/footer";
// import UserSync from "@/components/user-sync";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'


export const metadata = {
  title: {
    template: '%s | Support Agent',
    default: 'Support Agent',
  },
  description: 'Easily manage your support tickets with Support Agent.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased  `}>
          {/* <UserSync /> */}
          
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
      