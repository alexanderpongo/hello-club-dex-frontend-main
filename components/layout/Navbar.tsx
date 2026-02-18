"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import NavigationList from "./NavigationList";
import SideNavBar from "./SideNavBar";
import { EvmWalletConnectButton } from "../EvmWalletConnectButton";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import { useTheme } from "next-themes";

import { useSwapStore } from "@/store/useDexStore";
import { Button } from "../ui/button";
import { HelpCircle } from "lucide-react";
import { Suspense } from "react";

const Navbar = () => {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const { openOnboarding } = useSwapStore();

  useEffect(() => {
    window.onscroll = function (e) {
      if (window.scrollY > 1) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
  }, []);

  return (
    <header className="header">
      <div className="my-auto">
        <Link href={"/"}>
          <Image
            src={theme === "light" ? "/assets/htd.png" : "/assets/htln.png"}
            // src={
            //   theme === "dark"
            //     ? "/assets/hello-logo.svg"
            //     : "/assets/hello-logo-dark.svg"
            // }
            alt="hello-logo"
            width={!scrolled ? 100 : 60}
            height={85}
            priority
            className={`duration-200 cursor-pointer ${
              !scrolled ? "w-[40px] md:w-[100px]" : "w-[40px] md:w-[60px]"
            }`}
          />
        </Link>
      </div>

      <div className="my-auto hidden  md:flex md:gap-4 ml-auto mr-5">
        <div className="my-auto">
          <NavigationList />
        </div>
      </div>
      <div className="my-auto hidden md:flex md:gap-4 ">
        <div className="my-auto">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/5 dark:bg-dark border-none ring-1 ring-black/10 dark:ring-white/20 rounded-full"
            onClick={openOnboarding}
          >
            <HelpCircle />
            <span className="sr-only">Open Onboarding</span>
          </Button>
        </div>
        <div className="my-auto">
          <ModeToggle />
        </div>
        <div className="my-auto">
          <Suspense
            fallback={
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            }
          >
            <EvmWalletConnectButton />
          </Suspense>
        </div>
      </div>

      <div className="my-auto md:hidden flex gap-2">
        {/* {!session ? <SignInButton /> : <ProfileMenuButton />} */}
        <Button
          variant="outline"
          size="icon"
          className="bg-black/5 dark:bg-dark border-none ring-1 ring-black/10 dark:ring-white/20 rounded-full"
          onClick={openOnboarding}
        >
          <HelpCircle />
          <span className="sr-only">Open Onboarding</span>
        </Button>
        <ModeToggle />
        <SideNavBar />
      </div>
    </header>
  );
};

export default Navbar;
