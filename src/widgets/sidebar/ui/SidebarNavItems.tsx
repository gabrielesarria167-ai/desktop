import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AddLine, PlaylistLine, PlaylistFill } from "@mingcute/react";
import {
  sidebarLibraryItems,
  sidebarNavItems,
  type NavItem,
} from "@/features/navigation/data/navigation";
import { useModalStore, usePlaylistsList } from "@/features/library";
import { useTranslation } from "@/languages";
import { cn } from "@/shared/lib";

export interface SidebarNavItemsProps {
  searchOpen: boolean;
  onSearchToggle: () => void;
}

const ROW_CLASS =
  "group flex h-[34px] shrink-0 items-center gap-[10px] rounded-[8px] border-0 px-[10px] text-left text-[14px] text-text-primary no-underline cursor-pointer select-none transition-colors duration-150 active:scale-[0.99]";
const ROW_IDLE_CLASS =
  "bg-transparent font-[500] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]";
const ROW_ACTIVE_CLASS = "bg-black/[0.06] font-[600] dark:bg-white/[0.1]";
const SECTION_LABEL_CLASS =
  "px-[10px] pt-[18px] pb-[6px] text-[12px] font-[600] text-text-tertiary no-underline";

// an href is current when its path matches and every query param it names does too
function matchesLocation(href: string, pathname: string, search: string) {
  const [path, query = ""] = href.split("?");
  if (path === "/") return pathname === "/" || pathname === "/home";
  if (pathname !== path) return false;
  const current = new URLSearchParams(search);
  for (const [key, value] of new URLSearchParams(query)) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

const playlistHref = (id: string) =>
  `/library/playlist?id=${encodeURIComponent(id)}`;

export function SidebarNavItems({
  searchOpen,
  onSearchToggle,
}: SidebarNavItemsProps) {
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const openCreatePlaylist = useModalStore((state) => state.openCreatePlaylist);
  const { data: playlistsData } = usePlaylistsList();
  const playlists = playlistsData?.playlists ?? [];

  useEffect(() => {
    setPendingHref(null);
  }, [pathname, search]);

  const isActive = (href: string) =>
    pendingHref
      ? href === pendingHref
      : matchesLocation(href, pathname, search);

  const renderLink = (
    key: string,
    href: string,
    label: string,
    Icon: NavItem["Icon"],
    ActiveIcon?: NavItem["ActiveIcon"],
  ) => {
    const active = isActive(href);
    const RowIcon = active && ActiveIcon ? ActiveIcon : Icon;
    return (
      <Link
        key={key}
        to={href}
        aria-current={active ? "page" : undefined}
        onPointerDown={(event) => {
          if (event.button === 0) setPendingHref(href);
        }}
        onPointerLeave={(event) => {
          if (event.buttons & 1) setPendingHref(null);
        }}
        onPointerCancel={() => setPendingHref(null)}
        className={cn(ROW_CLASS, active ? ROW_ACTIVE_CLASS : ROW_IDLE_CLASS)}
      >
        {/* mingcute icons pin their own colour inline, so the accent comes from a wrapper */}
        <span className="flex shrink-0 text-accent-primary">
          <RowIcon size={18} />
        </span>
        <span className="min-w-0 truncate">{label}</span>
      </Link>
    );
  };

  const renderItem = (item: NavItem) =>
    item.href
      ? renderLink(
          item.id,
          item.href,
          t(item.labelKey ?? `common.sidebar.${item.id}`),
          item.Icon,
          item.ActiveIcon,
        )
      : null;

  const searchItem = sidebarNavItems.find((item) => item.id === "search");

  return (
    <>
      {searchItem && (
        <button
          type="button"
          aria-pressed={searchOpen}
          onClick={onSearchToggle}
          className={cn(
            ROW_CLASS,
            "mb-[8px] font-[400] text-text-tertiary",
            searchOpen
              ? "bg-black/[0.1] dark:bg-white/[0.14]"
              : "bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.1]",
          )}
        >
          <searchItem.Icon size={16} className="shrink-0" />
          <span className="min-w-0 truncate">{t("common.sidebar.search")}</span>
        </button>
      )}

      {sidebarNavItems.map(renderItem)}

      <Link to="/library" className={SECTION_LABEL_CLASS}>
        {t("common.sidebar.library")}
      </Link>
      {sidebarLibraryItems.map(renderItem)}

      <div className={SECTION_LABEL_CLASS}>{t("library.tab_playlists")}</div>
      <button
        type="button"
        onClick={() => openCreatePlaylist()}
        className={cn(ROW_CLASS, ROW_IDLE_CLASS)}
      >
        <span className="flex shrink-0 text-accent-primary">
          <AddLine size={18} />
        </span>
        <span className="min-w-0 truncate">{t("library.create_playlist")}</span>
      </button>
      {playlists.map((playlist) =>
        renderLink(
          `playlist-${playlist.id}`,
          playlistHref(playlist.id),
          playlist.title,
          PlaylistLine,
          PlaylistFill,
        ),
      )}
    </>
  );
}
