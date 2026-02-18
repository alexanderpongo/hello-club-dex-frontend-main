// import {
//   Users,
//   ListTodo,
//   Lock,
//   Folder,
//   Target,
//   ScanSearch,
//   UserRoundPen,
//   SquareCheckBig,
//   CalendarClock,
//   CircleUserRound,
// } from "lucide-react";

export const NavigationMenuItems: NavigationMenuItem[] = [
  {
    name: "DEX",
    href: "/",
    authRequired: false,
    active_state: ["/trade", "/lp"],
  },
  {
    name: "POOLS",
    href: "/pools",
    authRequired: false,
    active_state: ["/pools"],
  },
  {
    name: "TRADE",
    href: "/trading-live",
    authRequired: false,
    active_state: ["/trading-live"],
  },
  // {
  //   name: "DEX Aggregator",
  //   href: "/aggregator",
  //   authRequired: false,
  // },
  // {
  //   name: "Dashboard",
  //   href: "/dashboard",
  //   authRequired: true,
  // },
  {
    name: "LP Lock",
    href: "/lock",
    authRequired: false,
    active_state: ["/lock"],
  },
  {
    name: "CLUB",
    href: "https://club.hello.one/",
    authRequired: false,
    active_state: ["https://club.hello.one/"],
  },
  {
    name: "REFERRAL",
    href: "/referral",
    authRequired: false,
    active_state: ["/referral"],
  },
  {
    name: "EARN",
    href: "/earn/bonds",
    authRequired: false,
    active_state: ["/earn/bonds"],
  },
  // {
  //   name: "Earn",
  //   href: "/earn/bonds",
  //   authRequired: false,
  // },
  // {
  //   name: "Quests",
  //   href: "/quests",
  //   authRequired: false,
  // },
  // {
  //   name: "Tiers",
  //   href: "/tiers",
  //   authRequired: false,
  // },
  // {
  //   name: "Whales",
  //   href: "/whales",
  //   authRequired: false,
  // },
  // {
  //   name: "Events",
  //   href: "/events",
  //   authRequired: false,
  // },
  // {
  //   name: "",
  //   href: "/trading",
  //   authRequired: false,
  // },
];

export const AdminNavigationMenuItems = [
  // {
  //   menu: "Token Lock",
  //   icon: Lock,
  //   identifier: "/admin/lock",
  //   submenu: [
  //     {
  //       name: "Dashboard",
  //       href: "/admin/lock/dashboard",
  //     },
  //   ],
  // },
  // {
  //   menu: "Submissions",
  //   icon: SquareCheckBig,
  //   identifier: "/admin/submissions",
  //   submenu: [
  //     {
  //       name: "All Submissions",
  //       href: "/admin/submissions/all",
  //     },
  //   ],
  // },
  // {
  //   menu: "Quests",
  //   icon: ListTodo,
  //   identifier: "/admin/quests",
  //   submenu: [
  //     {
  //       name: "All Quests",
  //       href: "/admin/quests/all",
  //     },
  //     {
  //       name: "Create Quests",
  //       href: "/admin/quests/create",
  //     },
  //   ],
  // },
  // {
  //   menu: "Reviews",
  //   icon: ScanSearch,
  //   identifier: "/admin/reviews",
  //   submenu: [
  //     {
  //       name: "All Reviews",
  //       href: "/admin/reviews/all",
  //     },
  //   ],
  // },
  // {
  //   menu: "Reviewers",
  //   icon: UserRoundPen,
  //   identifier: "/admin/reviewers",
  //   submenu: [
  //     {
  //       name: "All Reviewers",
  //       href: "/admin/reviewers/all",
  //     },
  //   ],
  // },
  // {
  //   menu: "Events",
  //   icon: CalendarClock,
  //   identifier: "/admin/events",
  //   submenu: [
  //     {
  //       name: "All Events",
  //       href: "/admin/events/all",
  //     },
  //     {
  //       name: "Create Events",
  //       href: "/admin/events/create",
  //     },
  //   ],
  // },
  // {
  //   menu: "Whales",
  //   icon: CircleUserRound,
  //   identifier: "/admin/whales",
  //   submenu: [
  //     {
  //       name: "All Whales",
  //       href: "/admin/whales/all",
  //     },
  //     {
  //       name: "Create Whales",
  //       href: "/admin/whales/create",
  //     },
  //   ],
  // },
  // {
  //   menu: 'Quest Categories',
  //   icon: Folder,
  //   identifier: '/admin/categories',
  //   submenu: [
  //     {
  //       name: 'All Categories',
  //       href: '/admin/categories/all',
  //     },
  //     {
  //       name: 'Create Categories',
  //       href: '/admin/categories/create',
  //     },
  //   ],
  // },
  // {
  //   menu: 'Quest Objectives',
  //   icon: Target,
  //   identifier: '/admin/objectives',
  //   submenu: [
  //     {
  //       name: 'All Quest Objectives',
  //       href: '/admin/objectives/all',
  //     },
  //     {
  //       name: 'Create Quest Objective',
  //       href: '/admin/objectives/create',
  //     },
  //   ],
  // },
  // {
  //   menu: 'Users',
  //   icon: Users,
  //   identifier: '/admin/users',
  //   submenu: [
  //     {
  //       name: 'All Users',
  //       href: '/admin/users/all',
  //     },
  //     {
  //       name: 'Create User',
  //       href: '/admin/users/create',
  //     },
  //   ],
  // },
];
