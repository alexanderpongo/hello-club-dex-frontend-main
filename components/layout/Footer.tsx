"use client";
import Image from "next/image";
import React from "react";
import SocialLinks from "../SocialLinks";
import { Button } from "../ui/button";
import Link from "next/link";
import { CopyIcon } from "lucide-react";
import { toast } from "react-toastify";
import { OnRamp } from "../OnRamp";
import { useTheme } from "next-themes";

const Footer = () => {
  const { theme } = useTheme();
  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Copied Address");
  };

  return (
    <footer
      className="relative bg-transparent dark:bg-black z-30"
      aria-labelledby="footer-heading"
      id="footer"
    >
      <div className="container">
        <div className="flex items-center justify-center md:justify-start md:items-start">
          <div>
            <Image
              width={60}
              height={85}
              src={theme === "light" ? "/assets/htd.png" : "/assets/htln.png"}
              alt="HELLO"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-8 mt-8">
          <div className="mt-12 md:mt-0 font-formula">
            <h4 className="dark:text-white text-xl font-formula uppercase">
              Media{" "}
            </h4>
            <ul className="dark:text-white mt-4">
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://club.hello.one/"
                >
                  Hello Club
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/media/spaces"
                >
                  Lab talk
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/media/podcast"
                >
                  Crypto Podcast
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/media/tokened"
                >
                  Tokened
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/growth/incubator"
                >
                  Incubator
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/branding"
                >
                  Brand Kit
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-12 md:mt-0 font-formula">
            <h4 className="dark:text-white text-xl font-formula  uppercase">
              Club
            </h4>
            <ul className="dark:text-white mt-4">
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://club.hello.one/"
                >
                  $HELLO holders
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/club/ambassadors"
                >
                  KOLs
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/club/connect"
                >
                  Founders
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-12 md:mt-0 font-formula">
            <h4 className="dark:text-white text-xl font-formula uppercase">
              TV
            </h4>
            <ul className="dark:text-white mt-4">
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/killerwhales/s1e1"
                >
                  Killer Whales
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/killerwhales/live"
                >
                  KW: LIVE
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/killerwhales/apply"
                >
                  Apply Now
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary duration-200 transition-all"
                  href="https://www.hello.one/watch"
                >
                  Watch Now
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-12 md:mt-0 col-span-2 md:col-span-1">
            <div className="flex justify-center md:justify-end">
              <div className="uppercase font-formula text-base font-normal leading-6">
                <div className="text-primary flex justify-between gap-2">
                  <p className="text-nowrap">HELLO SOL ADDRESS:</p>
                  <div className="flex">
                    <p className="dark:text-white">4h49hPGphLNJNDRyi...</p>
                    <CopyIcon
                      className="dark:text-white w-4 cursor-pointer"
                      onClick={() =>
                        handleCopy(
                          "4h49hPGphLNJNDRyiBwzvKoasR3rw1WJCEv19PhUbSS4"
                        )
                      }
                    />
                  </div>
                </div>
                <div className="text-primary flex justify-between gap-2">
                  <p className="text-nowrap">HELLO ETH ADDRESS:</p>
                  <div className="flex">
                    <p className="dark:text-white">0x411099C0b413f4fed...</p>
                    <CopyIcon
                      className="dark:text-white w-4 cursor-pointer"
                      onClick={() =>
                        handleCopy("0x411099C0b413f4fedDb10Edf6a8be63BD321311C")
                      }
                    />
                  </div>
                </div>
                <div className="text-primary flex justify-between gap-2">
                  <p className="text-nowrap">HELLO BNB ADDRESS:</p>
                  <div className="flex">
                    <p className="dark:text-white">0x0F1cBEd8EFa0E012...</p>
                    <CopyIcon
                      className="dark:text-white w-4 cursor-pointer"
                      onClick={() =>
                        handleCopy("0x0F1cBEd8EFa0E012AdbCCB1638D0aB0147D5Ac00")
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 justify-center md:justify-end">
              <OnRamp />
              <Button
                className="button-primary !rounded-full uppercase !text-[14px] !font-bold !font-lato !leading-[20px]"
                asChild
              >
                <Link
                  href="https://bridge.hello.one/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bridge Tokens
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-4 mb-4">
          <div className="flex justify-center md:justify-start space-x-4">
            <div className="uppercase dark:text-white font-formula ">
              <p>HELLO Labs © {new Date().getFullYear()}</p>
            </div>
            <div className="">
              <Link
                href="https://whitepaper.hello.one/misc/privacy-policy"
                target="_blank"
                className="dark:text-white font-formula "
              >
                PRIVACY POLICY
              </Link>
            </div>
            <div className="">
              <Link
                href="https://www.hello.one/roadmap"
                target="_blank"
                className="dark:text-white font-formula uppercase"
              >
                Roadmap
              </Link>
            </div>
          </div>

          <div>
            <SocialLinks />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
