"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { AdminNavigationMenuItems } from "@/constants/NavigationItems";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="p-4 !bg-dark">
        <Image
          src="/assets/hello-logo.svg"
          alt="hello-logo"
          width={60}
          height={85}
          priority
        />
      </SidebarHeader>
      <SidebarContent className="!bg-dark">
        <SidebarMenu className="p-3">
          {/* {AdminNavigationMenuItems.map((item, index) => {
            const Icon = item.icon; // Extract the icon component

            return (
              <Collapsible
                key={index}
                defaultOpen={pathname.startsWith(item.identifier)}
                className="group"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    className="transition-all duration-300"
                    asChild
                  >
                    <SidebarMenuButton
                      className="flex items-center justify-between h-12 p-3"
                      isActive={pathname.startsWith(item.identifier)}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5" />}
                        {item.menu}
                      </div>
                      <ChevronDown className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="py-3 px-4 w-full">
                      {item.submenu.map((subItem, subIndex) => (
                        <SidebarMenuSubItem key={subIndex}>
                          <Link href={subItem.href}>
                            <SidebarMenuButton
                              className="h-10 p-3"
                              isActive={pathname === subItem.href}
                            >
                              {subItem.name}
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })} */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
