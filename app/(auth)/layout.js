"use client";
import "../globals.css";

export default function AuthLayout({children}) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            {children}
        </div>
    )
}