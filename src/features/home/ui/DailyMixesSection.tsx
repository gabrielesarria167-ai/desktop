import { memo } from "react";
import ScrollableRow from "@/shared/ui/ScrollableRow";
import { useTranslation } from "@/languages";
import type { DailyMix } from "../hooks/useDailyMixes";
import DailyMixCard from "./DailyMixCard";
import SectionHeading from "./SectionHeading";

export interface DailyMixesSectionProps {
  mixes: DailyMix[];
  headingMarginTop?: string;
}

function DailyMixesSection({
  mixes,
  headingMarginTop = "mt-[22px]",
}: DailyMixesSectionProps) {
  const { t } = useTranslation();
  if (mixes.length === 0) return null;

  return (
    <div className="flex flex-col">
      <SectionHeading
        title={t("home.dailyMixes")}
        marginTop={headingMarginTop}
      />

      <ScrollableRow className="flex gap-[28px] pl-3 pr-3 mt-[12px] overflow-x-auto pb-[2px]">
        {mixes.map((mix, index) => (
          <DailyMixCard
            key={`daily-mix-${mix.id}-${index}`}
            mix={mix}
            index={index}
          />
        ))}
      </ScrollableRow>
    </div>
  );
}

export default memo(DailyMixesSection);
