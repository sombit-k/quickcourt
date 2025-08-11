"use client";
import { inter } from "@/app/ui/font"
import "../globals.css";
import { useEffect, useRef } from 'react'

export default function AuthLayout({children}) {
    const containerRef = useRef(null);
    
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    return (
        <div 
            ref={containerRef}
            tabIndex={-1}
            className="flex justify-center items-center min-h-screen py-30 focus:outline-none"
        >
            {children}
        </div>
    )
}
