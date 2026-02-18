import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { NavigationMenuItems } from "@/constants/NavigationItems";
import { usePathname } from "next/navigation";
import { useNavBarStore } from "@/store";

const NavigationList = () => {
  const pathname = usePathname();
  const { closeSideNavBar } = useNavBarStore();

  return (
    <>
      <NavigationMenu>
        <NavigationMenuList className="flex flex-col md:flex-row">
          {NavigationMenuItems.map((item) => {
            const isActive = Array.isArray((item as any)?.active_state)
              ? (item as any).active_state.some(
                (p: string) => typeof p === "string" && pathname.startsWith(p)
              )
              : pathname === item.href || pathname.startsWith(item.href);

            return (
              <NavigationMenuItem key={item.name}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} relative`}
                    active={isActive}
                    target={item.name === "CLUB" ? "_blank" : "_self"}
                    rel={item.name === "CLUB" ? "noopener noreferrer" : ""}
                    onClick={closeSideNavBar}
                  >
                    <span className="text-lg">{item.name}</span>
                    {item?.name?.toLowerCase?.() === "earn" && (
                      <span
                        aria-hidden
                        className="absolute top-3 -right-1 h-2 w-2 rounded-full bg-red-500 "
                        title="New"
                      />
                    )}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};

export default NavigationList;
