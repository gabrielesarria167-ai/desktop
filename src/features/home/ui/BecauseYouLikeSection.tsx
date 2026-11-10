import { memo, type ReactNode } from "react";
import ScrollableRow from "@/shared/ui/ScrollableRow";
import type { AlbumItem } from "../hooks/useBecauseYouLike";
import { AlbumCard } from "./PopularTracksSection";
import SectionHeading from "./SectionHeading";

export interface BecauseYouLikeSectionProps {
  title: string;
  icon?: ReactNode;
  albums: AlbumItem[];
  headingMarginTop?: string;
}

// the first album is the main pick: double size, beside two rows of the rest
function BecauseYouLikeSection({
  title,
  icon,
  albums,
  headingMarginTop = "mt-[22px]",
}: BecauseYouLikeSectionProps) {
  const [pick, ...rest] = albums;
  if (!pick) return null;

  return (
    <div className="flex flex-col">
      <SectionHeading title={title} icon={icon} marginTop={headingMarginTop} />

      <ScrollableRow className="flex items-start gap-[28px] pl-3 pr-3 mt-[12px] overflow-x-auto pb-[2px]">
        <AlbumCard item={pick} index={0} large />
        {rest.length > 0 && (
          <div className="grid grid-flow-col grid-rows-2 gap-x-[28px] gap-y-[16px]">
            {rest.map((album, index) => (
              <AlbumCard
                key={`${album.item.id}-${index}`}
                item={album}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </ScrollableRow>
    </div>
  );
}

export default memo(BecauseYouLikeSection);
