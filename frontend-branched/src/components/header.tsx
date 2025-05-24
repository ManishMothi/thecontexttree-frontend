"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Playground", href: "/playground" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-lg font-semibold">
              Context Tree
            </Link>
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-black" : "text-muted-foreground"
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
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                    Sign up
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
