import { memo } from "react";
import ScrollableRow from "@/shared/ui/ScrollableRow";
import type { AlbumItem } from "../hooks/useBecauseYouLike";
import { AlbumCard } from "./PopularTracksSection";
import SectionHeading from "./SectionHeading";

export interface RecommendedPick {
  album: AlbumItem;
  /** shown above the title, e.g. "Because you like Franco126" */
  reason: string;
}

export interface RecommendedSectionProps {
  title: string;
  picks: RecommendedPick[];
  headingMarginTop?: string;
}

// the home page's lead row: large cards, each tinted by its own cover
function RecommendedSection({
  title,
  picks,
  headingMarginTop = "mt-[22px]",
}: RecommendedSectionProps) {
  if (picks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <SectionHeading title={title} marginTop={headingMarginTop} />

      <ScrollableRow className="flex gap-[20px] pl-3 pr-3 mt-[12px] overflow-x-auto pb-[2px]">
        {picks.map(({ album, reason }, index) => (
          <AlbumCard
            key={album.item.id}
            item={album}
            index={index}
            reason={reason}
          />
        ))}
      </ScrollableRow>
    </div>
  );
}

export default memo(RecommendedSection);
