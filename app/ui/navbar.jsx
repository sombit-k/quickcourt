"use client";
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'

export function NavbarDemo() {
    const navItems = [
        {
            name: "Book",
            link: "/book",
        },
        // {
        //     name: "All tickets",
        //     link: "/home",
        // },
        // {
        //     name: "Create New Ticket",
        //     link: "/ask",
        // }
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative w-full z-100">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton>
                                <NavbarButton variant="secondary">Login</NavbarButton>
                            </SignInButton>

                            <SignUpButton>
                                <NavbarButton variant="primary">Signup</NavbarButton>
                            </SignUpButton>

                        </SignedOut>
                        <SignedIn>
                            <UserButton appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }} />
                        </SignedIn>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                    </MobileNavHeader>

                    <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                        {navItems.map((item, idx) => (
                            
                            <Link
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300">
                                <span className="block"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-check-icon lucide-calendar-check"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg> {item.name}</span>
                            </Link>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            <SignedOut>
                            <SignInButton>
                                <NavbarButton variant="secondary">Login</NavbarButton>
                            </SignInButton>

                            <SignUpButton>
                                <NavbarButton variant="primary">Signup</NavbarButton>
                            </SignUpButton>

                        </SignedOut>
                        <SignedIn>
                            <UserButton appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }} />
                        </SignedIn>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
            {/* Navbar */}
        </div>
    );
}

