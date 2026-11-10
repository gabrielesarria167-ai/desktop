import type { ComponentType } from "react";
import {
  Home7Line,
  Home7Fill,
  Search3Line,
  HeartLine,
  HeartFill,
  PlaylistLine,
  PlaylistFill,
  AlbumLine,
  AlbumFill,
  MicLine,
  MicFill,
  LaptopLine,
  LaptopFill,
  Settings4Line,
  Settings4Fill,
} from "@mingcute/react";
import { Tuning2 } from "@solar-icons/react";

type NavIcon = ComponentType<{ size?: number; className?: string }>;

export interface NavItem {
  id: string;
  label: string;
  /** translation key; `common.sidebar.<id>` when omitted */
  labelKey?: string;
  href?: string;
  Icon: NavIcon;
  /** Fill variant shown while the item is the current page */
  ActiveIcon?: NavIcon;
}

export const sidebarNavItems: NavItem[] = [
  { id: "search", label: "Search", Icon: Search3Line },
  {
    id: "home",
    label: "Home",
    href: "/",
    Icon: Home7Line,
    ActiveIcon: Home7Fill,
  },
  {
    id: "equalizer",
    label: "Equalizer",
    labelKey: "player.equalizer",
    href: "/equalizer",
    Icon: Tuning2,
  },
  {
    id: "settings",
    label: "Settings",
    Icon: Settings4Line,
    ActiveIcon: Settings4Fill,
  },
];

export const sidebarLibraryItems: NavItem[] = [
  {
    id: "liked",
    label: "Liked Songs",
    labelKey: "library.liked_songs",
    href: "/library/playlist?id=likes",
    Icon: HeartLine,
    ActiveIcon: HeartFill,
  },
  {
    id: "playlists",
    label: "Playlists",
    labelKey: "library.tab_playlists",
    href: "/library?tab=playlists",
    Icon: PlaylistLine,
    ActiveIcon: PlaylistFill,
  },
  {
    id: "albums",
    label: "Albums",
    labelKey: "library.tab_albums",
    href: "/library?tab=albums",
    Icon: AlbumLine,
    ActiveIcon: AlbumFill,
  },
  {
    id: "artists",
    label: "Artists",
    labelKey: "library.tab_artists",
    href: "/library?tab=artists",
    Icon: MicLine,
    ActiveIcon: MicFill,
  },
  {
    id: "local",
    label: "On this device",
    labelKey: "library.local.title",
    href: "/library/local",
    Icon: LaptopLine,
    ActiveIcon: LaptopFill,
  },
];
