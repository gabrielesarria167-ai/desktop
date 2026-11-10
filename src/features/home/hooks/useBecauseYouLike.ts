import { api, mediaUrl } from "@/shared/api";
import { freshFor, useCachedResource } from "@/shared/cache/useCachedResource";
import type { PopularItem } from "./usePopularTracks";

export type AlbumItem = PopularItem & { type: "album" };

export interface BecauseYouLike {
  artist: string;
  albums: AlbumItem[];
}

// one big pick plus two rows of four
const MAX_ALBUMS = 9;
const POLICY = { isFresh: freshFor(6 * 60 * 60_000) };

async function loadBecauseYouLike(
  artistId: string | undefined,
): Promise<BecauseYouLike | null> {
  if (!artistId) return null;
  const artist = await api.getArtist(artistId);
  return {
    artist: artist.name,
    albums: artist.albums.slice(0, MAX_ALBUMS).map((album): AlbumItem => ({
      type: "album",
      item: {
        id: album.id,
        title: album.title,
        artist: artist.name,
        coverUrl: album.cover ? mediaUrl(album.cover.url) : "",
        totalTracks: album.totalTracks ?? album.trackCount ?? 0,
        albumType: "album",
        explicit: album.explicit,
      },
      playCount: 0,
    })),
  };
}

// seeded by the most recently played track whose artist can be looked up
export function useBecauseYouLike(recent: PopularItem[]) {
  const seed = recent.find(
    (entry) => entry.type === "track" && entry.item.artistId,
  );
  const artistId = seed?.type === "track" ? seed.item.artistId : undefined;
  const { data } = useCachedResource(
    `home:because:${artistId ?? "none"}`,
    () => loadBecauseYouLike(artistId),
    POLICY,
  );
  return data ?? null;
}
