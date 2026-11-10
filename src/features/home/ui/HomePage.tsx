import { useState, useEffect, useMemo } from "react";
import PopularTracksSection from "./PopularTracksSection";
import DailyMixesSection from "./DailyMixesSection";
import HomePageSkeleton, { MixesSectionSkeleton } from "./HomePageSkeleton";
import { usePopularTracksAllTime } from "../hooks/usePopularTracks";
import { useListeningNow } from "../hooks/useListeningNow";
import ListeningNowSection from "./ListeningNowSection";
import RecommendedSection, { type RecommendedPick } from "./RecommendedSection";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";
import { useBecauseYouLike, type AlbumItem } from "../hooks/useBecauseYouLike";
import { useDailyMixes } from "../hooks/useDailyMixes";
import { useMostSaved, usePopularAlbums } from "../hooks/useExploreCollections";
import { useTranslation } from "@/languages";
import { usePageBackdrop } from "@/shared/lib";
import { useHomeBackdrop } from "../hooks/useHomeBackdrop";

const MAX_RECOMMENDED = 10;

export default function HomePage() {
  const { t } = useTranslation();

  const { tracks: listeningNow, isLoading: tracksLoading } = useListeningNow();
  const { data: popularTracksAllTime, isLoading: allTimeLoading } =
    usePopularTracksAllTime(20);
  const { data: recentlyPlayed, isLoading: recentLoading } =
    useRecentlyPlayed(20);
  const { items: popularAlbums, isLoading: albumsLoading } = usePopularAlbums();
  const { items: mostSaved, isLoading: savedLoading } = useMostSaved();
  const { data: dailyMixes, isLoading: mixesLoading } = useDailyMixes();
  const becauseYouLike = useBecauseYouLike(recentlyPlayed);
  const hasMixes = dailyMixes.length > 0;
  const firstAlbum = popularAlbums[0];
  const firstAlbumCover =
    firstAlbum?.type === "album" ? firstAlbum.item.coverUrl : undefined;
  const homeBackdrop = useHomeBackdrop(dailyMixes);
  const usesMixBackdrop = hasMixes || mixesLoading;
  usePageBackdrop(
    usesMixBackdrop
      ? homeBackdrop.backdrop
      : firstAlbumCover || listeningNow[0]?.coverUrl || undefined,
    usesMixBackdrop ? { blur: 56, dim: 0.22 } : undefined,
  );

  // albums by an artist you played, alternated with what is trending so the row
  // is not one discography
  const recommended = useMemo(() => {
    const because = becauseYouLike?.albums ?? [];
    const trending = popularAlbums.filter(
      (entry): entry is AlbumItem => entry.type === "album",
    );
    const becauseReason = becauseYouLike
      ? t("home.becauseYouLike", { name: becauseYouLike.artist })
      : "";
    const trendingReason = t("home.trendingBadge");
    const seen = new Set<string>();
    const picks: RecommendedPick[] = [];
    const add = (album: AlbumItem | undefined, reason: string) => {
      if (!album || seen.has(album.item.id)) return;
      seen.add(album.item.id);
      picks.push({ album, reason });
    };
    for (let i = 0; i < Math.max(because.length, trending.length); i++) {
      add(because[i], becauseReason);
      add(trending[i], trendingReason);
    }
    return picks.slice(0, MAX_RECOMMENDED);
  }, [becauseYouLike, popularAlbums, t]);

  // an album already shown as a pick is not repeated in Top Albums
  const topAlbums = useMemo(() => {
    const picked = new Set(recommended.map((pick) => pick.album.item.id));
    return popularAlbums.filter((entry) => !picked.has(entry.item.id));
  }, [popularAlbums, recommended]);

  const isDataLoading =
    tracksLoading ||
    allTimeLoading ||
    recentLoading ||
    albumsLoading ||
    savedLoading;

  const isReady = !isDataLoading;
  const [skeletonExited, setSkeletonExited] = useState(() => !isDataLoading);

  useEffect(() => {
    if (isReady && !skeletonExited) {
      const timer = setTimeout(() => {
        setSkeletonExited(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isReady, skeletonExited]);

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-transparent pt-(--page-inset-top) pb-(--page-inset-bottom)">
      <div className="relative z-1 grid grid-cols-1 items-start w-full">
        {isReady && (
          <div className="col-start-1 row-start-1 w-full pb-[16px]">
            <h1 className="font-roboto-flex-heading m-0 px-3 pt-[2px] text-[34px] leading-[1.2] text-text-primary">
              {t("common.sidebar.home")}
            </h1>

            <RecommendedSection
              title={t("home.recommended")}
              picks={recommended}
              headingMarginTop="mt-[18px]"
            />

            {recentlyPlayed && recentlyPlayed.length > 0 && (
              <PopularTracksSection
                title={t("home.jumpBackIn")}
                items={recentlyPlayed}
              />
            )}

            {mixesLoading ? (
              <div className="mt-[22px]">
                <MixesSectionSkeleton />
              </div>
            ) : (
              hasMixes && (
                <div style={{ animation: "page-enter 200ms ease-out" }}>
                  <DailyMixesSection mixes={dailyMixes} />
                </div>
              )
            )}

            {topAlbums.length > 0 && (
              <PopularTracksSection
                title={t("home.popularAlbums")}
                items={topAlbums}
              />
            )}

            {listeningNow.length > 0 && (
              <ListeningNowSection
                title={t("home.whatEveryonesOn")}
                tracks={listeningNow}
              />
            )}

            {popularTracksAllTime && popularTracksAllTime.length > 0 && (
              <PopularTracksSection
                title={t("home.mostListened")}
                items={popularTracksAllTime}
              />
            )}

            {mostSaved.length > 0 && (
              <PopularTracksSection
                title={t("home.mostSaved")}
                items={mostSaved}
              />
            )}
          </div>
        )}

        {!skeletonExited && (
          <div
            className={`col-start-1 row-start-1 w-full z-10 transition-opacity duration-300 ease-out ${
              isReady
                ? "opacity-0 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
            onTransitionEnd={() => setSkeletonExited(true)}
          >
            <HomePageSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}
