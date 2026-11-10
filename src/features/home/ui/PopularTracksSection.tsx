import { memo, useState, useRef, useCallback } from "react";
import { useStableNavigate } from "@/shared/hooks/useStableNavigate";
import {
  collectionPath,
  collectionPreviewState,
} from "@/features/collection/lib/collectionPreview";
import { prefetchCollection } from "@/features/collection/hooks/useCollection";
import ScrollableRow from "@/shared/ui/ScrollableRow";
import { playerEngine } from "@/features/player";
import { useSongMenuItems } from "@/features/player/hooks/useSongMenuItems";
import { usePlayerStore } from "@/features/player/store/playerStore";
import { useToast } from "@/shared/ui";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import type { PopularItem } from "../hooks/usePopularTracks";

import ArtistLink from "@/features/artist/ui/ArtistLink";
import CoverImage from "@/features/covers/ui/CoverImage";
import ExplicitBadge from "@/shared/ui/ExplicitBadge";
import { useTranslation } from "@/languages";
import SectionHeading from "./SectionHeading";

export interface PopularTracksSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  items: PopularItem[];
  showRanks?: boolean;
  headingMarginTop?: string;
  rowClassName?: string;
}

function TrackCard({
  item,
  index,
  showRanks,
}: {
  item: PopularItem & { type: "track" };
  index: number;
  showRanks?: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const trackDoubleClickBehavior = usePlayerStore(
    (state) => state.trackDoubleClickBehavior,
  );

  const menuItems = useSongMenuItems({
    id: item.item.id,
    title: item.item.title,
    artists: item.item.artists,
    coverUrl: item.item.coverUrl,
    durationMs: item.item.durationMs,
    searchType: "track",
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (menuItems.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setMenuOpen(true);
    },
    [menuItems],
  );

  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
    if (!isOpen) setMenuPosition(null);
  }, []);

  const handlePlay = useCallback(() => {
    void playerEngine.playTrack(
      item.item,
      [item.item],
      `${item.item.title} Radio`,
      item.item.coverUrl,
    );
  }, [item.item]);

  const handleDoubleClick = useCallback(() => {
    if (trackDoubleClickBehavior === "queue") {
      playerEngine.addToQueue({
        id: item.item.id,
        title: item.item.title,
        artists: item.item.artists,
        coverUrl: item.item.coverUrl,
        durationMs: item.item.durationMs,
        playCount: item.item.playCount ?? 0,
      });
      toast(t("common.added_to_queue"), "checkmark", {
        description: item.item.artists
          ? `${item.item.title} — ${item.item.artists}`
          : item.item.title,
      });
    } else {
      handlePlay();
    }
  }, [trackDoubleClickBehavior, item.item, handlePlay, toast, t]);

  const handleClick = (e: React.MouseEvent) => {
    const detail = (e as React.MouseEvent<HTMLDivElement>).detail;
    if (detail >= 2) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      handleDoubleClick();
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      handlePlay();
    }, 200);
  };

  return (
    <div
      className="group flex-shrink-0 w-[175px] cursor-pointer select-none"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-border-alpha-14">
        {showRanks && (
          <div
            className={`absolute top-2 left-2 z-10 flex items-center justify-center min-w-[22px] h-[20px] px-1 rounded-[3px] text-[10px] font-bold tracking-tight ${
              index === 0
                ? "bg-amber-400 text-black"
                : index === 1
                  ? "bg-slate-200 text-black"
                  : index === 2
                    ? "bg-amber-700 text-white"
                    : "bg-bg-panel text-text-secondary"
            }`}
          >
            #{index + 1}
          </div>
        )}

        {item.item.coverUrl && (
          <CoverImage
            src={item.item.coverUrl}
            alt={item.item.title}
            fill
            sizes="175px"
            className={`object-cover transition-all duration-300 group-hover:brightness-[1.15] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>

      <div className="flex flex-col mt-[8px]">
        <span className="truncate text-[14px] font-[500] text-text-primary">
          {item.item.title}
        </span>
        <div className="flex min-w-0 items-center overflow-hidden text-[13px] text-text-tertiary">
          {item.item.explicit && (
            <ExplicitBadge size="md" className="mr-[6px] shrink-0" />
          )}
          <ArtistLink
            name={item.item.artists}
            artistId={item.item.artistId}
            artistList={item.item.artistList}
            className="text-[13px] text-text-tertiary"
          />
        </div>
      </div>

      {menuItems.length > 0 && (
        <DropdownMenu
          trigger={<span />}
          items={menuItems}
          open={menuOpen}
          onOpenChange={handleMenuOpenChange}
          position={menuPosition}
        />
      )}
    </div>
  );
}

export function AlbumCard({
  item,
  index,
  showRanks,
  large = false,
  reason,
}: {
  item: PopularItem & { type: "album" };
  index: number;
  showRanks?: boolean;
  large?: boolean;
  /** why it is recommended; turns the card into the large tinted pick */
  reason?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useStableNavigate();

  const menuItems = useSongMenuItems({
    id: item.item.id,
    title: item.item.title,
    artists: item.item.artist,
    coverUrl: item.item.coverUrl,
    searchType: "album",
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (menuItems.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setMenuOpen(true);
    },
    [menuItems],
  );

  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
    if (!isOpen) setMenuPosition(null);
  }, []);

  const handleClick = () => {
    navigate(
      collectionPath("album", item.item.id),
      collectionPreviewState({
        coverUrl: item.item.coverUrl,
        title: item.item.title,
        subtitle: item.item.artist,
      }),
    );
  };

  const menu = menuItems.length > 0 && (
    <DropdownMenu
      trigger={<span />}
      items={menuItems}
      open={menuOpen}
      onOpenChange={handleMenuOpenChange}
      position={menuPosition}
    />
  );

  if (reason) {
    return (
      <div
        className="group relative flex w-[250px] flex-shrink-0 cursor-pointer select-none flex-col gap-[16px] overflow-hidden rounded-xl bg-border-alpha-14 px-[24px] pt-[24px] pb-[22px]"
        onPointerDown={() => prefetchCollection("album", item.item.id)}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* the card takes its colour from its own cover, blurred behind it */}
        {item.item.coverUrl && (
          <CoverImage
            src={item.item.coverUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="250px"
            className={`scale-150 object-cover blur-[36px] saturate-150 transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.4)]">
          {item.item.coverUrl && (
            <CoverImage
              src={item.item.coverUrl}
              alt={item.item.title}
              fill
              sizes="202px"
              className={`object-cover transition-all duration-300 group-hover:brightness-[1.15] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>
        <div className="relative flex min-w-0 flex-col gap-[2px] text-white">
          <span className="truncate text-[12px] font-[600] text-white/80">
            {reason}
          </span>
          <span className="truncate text-[17px] font-[700]">
            {item.item.title}
          </span>
          <span className="truncate text-[13px] text-white/80">
            {item.item.artist}
          </span>
        </div>
        {menu}
      </div>
    );
  }

  return (
    <div
      className={`group flex-shrink-0 ${large ? "w-[378px]" : "w-[175px]"} cursor-pointer select-none`}
      onPointerDown={() => prefetchCollection("album", item.item.id)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-border-alpha-14">
        {showRanks && (
          <div className="absolute top-2 left-2 z-10 flex items-center justify-center min-w-[22px] h-[20px] px-1 rounded-[3px] text-[10px] font-bold tracking-tight bg-bg-panel text-text-secondary">
            #{index + 1}
          </div>
        )}
        {item.item.coverUrl && (
          <CoverImage
            src={item.item.coverUrl}
            alt={item.item.title}
            fill
            sizes={large ? "378px" : "175px"}
            className={`object-cover transition-all duration-300 group-hover:brightness-[1.15] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
      <div className="flex flex-col mt-[8px]">
        <span
          className={`truncate text-text-primary ${large ? "text-[18px] font-[600]" : "text-[14px] font-[500]"}`}
        >
          {item.item.title}
        </span>
        <div className="flex min-w-0 items-center overflow-hidden text-[13px] text-text-tertiary">
          {item.item.explicit && (
            <ExplicitBadge size="md" className="mr-[6px] shrink-0" />
          )}
          <ArtistLink
            name={item.item.artist}
            className="text-[13px] text-text-tertiary"
          />
        </div>
      </div>

      {menu}
    </div>
  );
}

function PlaylistCard({
  item,
  index,
  showRanks,
}: {
  item: PopularItem & { type: "playlist" };
  index: number;
  showRanks?: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useStableNavigate();

  const menuItems = useSongMenuItems({
    id: item.item.id,
    title: item.item.title,
    artists: item.item.owner,
    coverUrl: item.item.coverUrl,
    searchType: "playlist",
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (menuItems.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setMenuOpen(true);
    },
    [menuItems],
  );

  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
    if (!isOpen) setMenuPosition(null);
  }, []);

  const handleClick = () => {
    navigate(
      collectionPath("playlist", item.item.id),
      collectionPreviewState({
        coverUrl: item.item.coverUrl,
        title: item.item.title,
        subtitle: item.item.owner,
      }),
    );
  };

  return (
    <div
      className="group flex-shrink-0 w-[175px] cursor-pointer select-none"
      onPointerDown={() => prefetchCollection("playlist", item.item.id)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-border-alpha-14">
        {showRanks && (
          <div className="absolute top-2 left-2 z-10 flex items-center justify-center min-w-[22px] h-[20px] px-1 rounded-[3px] text-[10px] font-bold tracking-tight bg-bg-panel text-text-secondary">
            #{index + 1}
          </div>
        )}
        {item.item.coverUrl && (
          <CoverImage
            src={item.item.coverUrl}
            alt={item.item.title}
            fill
            sizes="175px"
            className={`object-cover transition-all duration-300 group-hover:brightness-[1.15] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
      <div className="flex flex-col mt-[8px]">
        <span className="truncate text-[14px] font-[500] text-text-primary">
          {item.item.title}
        </span>
        <span className="truncate text-[13px] text-text-tertiary">
          {item.item.owner}
        </span>
      </div>

      {menuItems.length > 0 && (
        <DropdownMenu
          trigger={<span />}
          items={menuItems}
          open={menuOpen}
          onOpenChange={handleMenuOpenChange}
          position={menuPosition}
        />
      )}
    </div>
  );
}

function PopularItemCard({
  item,
  index,
  showRanks,
}: {
  item: PopularItem;
  index: number;
  showRanks?: boolean;
}) {
  switch (item.type) {
    case "track":
      return <TrackCard item={item} index={index} showRanks={showRanks} />;
    case "album":
      return <AlbumCard item={item} index={index} showRanks={showRanks} />;
    case "playlist":
      return <PlaylistCard item={item} index={index} showRanks={showRanks} />;
  }
}

function PopularTracksSection({
  title,
  subtitle,
  icon,
  badge,
  items,
  showRanks = false,
  headingMarginTop = "mt-[22px]",
  rowClassName = "",
}: PopularTracksSectionProps) {
  return (
    <div className="flex flex-col">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        icon={icon}
        badge={badge}
        marginTop={headingMarginTop}
      />

      <ScrollableRow
        className={`flex gap-[28px] pl-3 pr-3 mt-[12px] overflow-x-auto pb-[2px] ${rowClassName}`}
      >
        {items.map((item, index) => (
          <PopularItemCard
            key={`${item.type}-${item.item.id}-${index}`}
            item={item}
            index={index}
            showRanks={showRanks}
          />
        ))}
      </ScrollableRow>
    </div>
  );
}

export default memo(PopularTracksSection);
