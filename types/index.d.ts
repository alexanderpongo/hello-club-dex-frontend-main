declare type NavigationMenuItem = {
  name: string;
  href: string;
  authRequired?: boolean;
  active_state: string[];
  submenu?: {
    name: string;
    href: string;
  }[];
};

declare type ExclusiveEvent = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  thumbnail: string;
};

declare type LaunchpadProject = {
  title: string;
  coverImage: string;
  avatarImage: string;
  tokenPrice: number;
  tokenSymbol: string;
  registerPeriod: string;
  projectNetwork: string;
  networkIcon: string;
  tokenContract: string;
};

declare type StatCardProps = {
  label: string;
  value: string;
  avatarImage?: string;
  isLoading: boolean;
};

declare type WhaleMetadata = {
  firstName: string;
  lastName: string;
  avatarImage: string;
  profession: string;
  sevenDaysPnl: number;
  roi: number;
  aum: number;
  sevenDaysMdd: number;
  sharpeRatio: number | null;
};

declare type TierMetadata = {
  id: number;
  name: string;
  threshold: number;
  image: string;
  nftImage: string;
};

declare type Whale = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  profession: string;
  description: string;
  roi?: number;
  aum?: number;
  imgUrl: string;
  twitterUrl?: string;
  instagramUrl?: string;
  portfolioUrl?: string;
  whaleID: string;
  email: string;
  contributingProjects: [];
  followers: Follower[];
};

declare type WhaleUser = {
  _id: string;
  userID: string;
  name: string;
  email: string;
  isWhale: true;
  followingWhales: Whale[];
};

declare type Follower = {
  userId: string;
  name: string;
  email: string;
};

declare type PaginationMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};
