import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Building, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const Header = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Clubs", path: "/clubs" },
    { name: "Dashboard", path: "/dashboard" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CampusConnect</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:block">
            <Link href="/#waitlist">
              <Button>Join Waitlist</Button>
            </Link>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeSheet}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === item.path ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <ThemeToggle />
                </div>
                <Link href="/#waitlist" onClick={closeSheet}>
                  <Button className="w-full mt-4">Join Waitlist</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
