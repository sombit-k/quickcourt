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
            name: "book",
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
                                <span className="block">{item.name}</span>
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

