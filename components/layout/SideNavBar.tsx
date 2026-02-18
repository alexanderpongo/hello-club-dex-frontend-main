import React, { Suspense } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import NavigationList from "./NavigationList";
import { IoMenu } from "react-icons/io5";
import { useNavBarStore } from "@/store";
import { EvmWalletConnectButton } from "../EvmWalletConnectButton";

const SideNavBar = () => {
  const { isSideNavBarOpen, openSideNavBar, closeSideNavBar } =
    useNavBarStore();

  return (
    <Sheet
      open={isSideNavBarOpen}
      onOpenChange={(open) => (open ? openSideNavBar() : closeSideNavBar())}
    >
      <SheetTrigger>
        <IoMenu className="text-[26px]" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full border-none bg-white dark:bg-black"
      >
        <SheetHeader>
          <SheetTitle className="-mt-3">
            <Image
              src="/assets/hello-logo.svg"
              alt="hello-logo"
              width={100}
              height={100}
              priority
              className="w-[60px] h-auto"
            />
          </SheetTitle>
          <SheetDescription className="flex flex-col gap-3 pt-3">
            <div className="mx-auto">
              <Suspense
                fallback={
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                }
              >
                <EvmWalletConnectButton />
              </Suspense>
            </div>
            <div className="mx-auto">
              <NavigationList />
            </div>

            {/* <Button
              className="button-primary"
              asChild
              onClick={closeSideNavBar}
            >
              <Link href="/">Buy $HELLO</Link>
            </Button> */}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default SideNavBar;
