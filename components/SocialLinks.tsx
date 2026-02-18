"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

const SocialLinks = () => {
  const { theme } = useTheme();

  return (
    <div className="flex space-x-2 md:space-x-0 flex-wrap justify-center sm:justify-start items-center mt-8 mx-auto md:mx-0">
      <Link
        href="https://t.me/HELLOLabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light"
              ? "/icons/telegram-dark.svg"
              : "/icons/telegram.svg"
          }
          alt="telegram"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://discord.gg/hellolabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light" ? "/icons/discord-dark.svg" : "/icons/discord.svg"
          }
          alt="discord"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://coinmarketcap.com/currencies/hello-labs/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light"
              ? "/icons/coin-market-cap-dark.svg"
              : "/icons/coin-market-cap.svg"
          }
          alt="cmc"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://x.com/thehellolabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={theme === "light" ? "/icons/x-dark.svg" : "/icons/x.svg"}
          alt="x"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://facebook.com/thehellolabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light"
              ? "/icons/facebook-dark.svg"
              : "/icons/facebook.svg"
          }
          alt="facebook"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://instagram.com/thehellolabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={theme === "light" ? "/icons/insta-dark.svg" : "/icons/insta.svg"}
          alt="insta"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://youtube.com/c/HELLOLabs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light" ? "/icons/youtube-dark.svg" : "/icons/youtube.svg"
          }
          alt="youtube"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://www.linkedin.com/company/hello-hq/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light"
              ? "/icons/linkedin-dark.svg"
              : "/icons/linkedin.svg"
          }
          alt="linkedin"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>

      <Link
        href="https://www.dextools.io/app/en/solana/pair-explorer/FqfttpudzsmLbnx6jR5FBpqJCJxQuvT8tAS2ma68HHQe?t=1717702528539"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={
            theme === "light"
              ? "/icons/dextools-dark.svg"
              : "/icons/dextools.svg"
          }
          alt="dextools"
          width={100}
          height={100}
          className="w-[33px] h-auto cursor-pointer scale-75"
        />
      </Link>
    </div>
  );
};

export default SocialLinks;
