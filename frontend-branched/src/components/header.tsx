"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Playground", href: "/playground" },
  { name: "Docs", href: "/docs" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <nav className="flex items-center space-x-6">
            <Link href="/" className="flex items-center text-xl font-bold">
              <Image
                src="/branched-logo.png"
                alt="Context Tree Logo"
                width={28}
                height={28}
                className="mr-2"
              />
              Branched
            </Link>
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? "text-black font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <div className="flex space-x-2">
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                    Get Branched Free
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
