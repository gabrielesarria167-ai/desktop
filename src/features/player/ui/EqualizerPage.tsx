import { useRef, useState } from "react";
import { CheckLine } from "@mingcute/react";
import { useTranslation } from "@/languages";
import { cn } from "@/shared/lib";
import Button from "@/shared/ui/Button";
import MenuSelect from "@/shared/ui/MenuSelect";
import ToggleSwitch from "@/shared/ui/ToggleSwitch";
import {
  HERO_BUTTON_CLASS,
  HERO_GLASS_BUTTON_CLASS,
  HERO_GLASS_CLASS,
} from "@/shared/ui/EntityHero";
import { usePlayerState } from "../hooks/usePlayerState";
import { playerEngine } from "../engine/playerEngine";
import {
  EQ_BANDS,
  EQ_MAX_CUSTOM_PRESETS,
  EQ_MAX_DB,
  EQ_MIN_DB,
  EQ_PRESETS,
  EQ_PRESET_NAME_MAX,
  FLAT_EQ,
  findEqCustomPreset,
  findEqPreset,
  isEqFlat,
} from "../engine/equalizer";
import { bandSliderHandlers, formatDb, toRatio } from "./EqualizerPicker";
import { EQ_CURVE_WIDTH, eqCurvePaths } from "./equalizerCurve";

const PLOT_HEIGHT = 320;
const GRID_LINES = [0, 25, 50, 75, 100];
const CUSTOM_PREFIX = "custom:";

const frequencyLabel = (hz: number) =>
  hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`;

interface CurvePointProps {
  frequency: number;
  index: number;
  value: number;
  onChange: (db: number) => void;
}

// one band: a full-height column you drag anywhere in, with the point on the curve
function CurvePoint({ frequency, index, value, onChange }: CurvePointProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const label = frequencyLabel(frequency);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={EQ_MIN_DB}
      aria-valuemax={EQ_MAX_DB}
      aria-valuenow={value}
      aria-valuetext={`${formatDb(value)} dB`}
      title={label}
      className="group absolute inset-y-0 w-[32px] -translate-x-1/2 cursor-ns-resize touch-none outline-none"
      style={{ left: `${((index + 0.5) / EQ_BANDS.length) * 100}%` }}
      {...bandSliderHandlers(trackRef, value, onChange)}
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/[0.06] dark:bg-white/[0.07]" />
      <div
        className="absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.55)] transition-transform duration-150 group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:ring-4 group-focus-visible:ring-white/30"
        style={{ bottom: `${toRatio(value) * 100}%` }}
      />
    </div>
  );
}

export default function EqualizerPage() {
  const { t } = useTranslation();
  const player = usePlayerState();
  const isEqEnabled = player.isEqEnabled ?? false;
  const eqGains = player.eqGains ?? FLAT_EQ;
  const customPresets = player.eqCustomPresets ?? [];
  const activePreset = findEqPreset(eqGains);
  const activeCustom = activePreset
    ? null
    : findEqCustomPreset(customPresets, eqGains);
  const isFlat = isEqFlat(eqGains);
  const isManual = !isFlat && !activePreset && !activeCustom;

  const [isNaming, setIsNaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  // touching a band or a preset means "I want the EQ": switch it on
  const applyGains = (gains: number[]) => {
    playerEngine.setEqGains(gains);
    if (!isEqEnabled) playerEngine.setIsEqEnabled(true);
  };

  const setBand = (index: number, db: number) => {
    const gains = [...eqGains];
    gains[index] = db;
    applyGains(gains);
  };

  const commitName = () => {
    if (draftName.trim()) playerEngine.saveEqPreset(draftName);
    setDraftName("");
    setIsNaming(false);
  };

  const presetValue = isFlat
    ? "flat"
    : activePreset
      ? activePreset.id
      : activeCustom
        ? `${CUSTOM_PREFIX}${activeCustom.id}`
        : "manual";

  const presetOptions = [
    { value: "flat", label: t("player.eq_flat") },
    // an unsaved curve is listed only while it is the one in use
    ...(isManual ? [{ value: "manual", label: t("player.eq_manual") }] : []),
    ...customPresets.map((preset) => ({
      value: `${CUSTOM_PREFIX}${preset.id}`,
      label: preset.name,
    })),
    ...EQ_PRESETS.map((preset) => ({
      value: preset.id,
      label: t(`player.eq_preset_${preset.id}`),
    })),
  ];

  const selectPreset = (value: string) => {
    if (value === "flat") return applyGains(FLAT_EQ);
    const gains = value.startsWith(CUSTOM_PREFIX)
      ? customPresets.find(
          (preset) => preset.id === value.slice(CUSTOM_PREFIX.length),
        )?.gains
      : EQ_PRESETS.find((preset) => preset.id === value)?.gains;
    if (gains) applyGains(gains);
  };

  const { line, area } = eqCurvePaths(eqGains, PLOT_HEIGHT);
  const canSaveMore = customPresets.length < EQ_MAX_CUSTOM_PRESETS;
  const glassButtonClass = `${HERO_BUTTON_CLASS} ${HERO_GLASS_BUTTON_CLASS} px-[14px] text-text-primary`;

  return (
    <div
      className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-transparent pt-(--page-inset-top) pb-(--page-inset-bottom)"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="flex flex-col gap-[20px] px-3 pt-[2px] pb-[16px]">
        <header className="flex items-end justify-between gap-[16px]">
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h1 className="font-roboto-flex-heading m-0 text-[34px] leading-[1.2] text-text-primary">
              {t("player.equalizer")}
            </h1>
            <p className="m-0 text-[15px] text-text-secondary">
              {t("player.equalizer_hint")}
            </p>
          </div>
          <div className="mb-[6px] shrink-0">
            <ToggleSwitch
              checked={isEqEnabled}
              ariaLabel={t("player.equalizer")}
              onChange={(enabled) => playerEngine.setIsEqEnabled(enabled)}
            />
          </div>
        </header>

        <section
          className="flex flex-col gap-[28px] rounded-[14px] bg-black/[0.03] px-[20px] pt-[18px] pb-[20px] backdrop-blur-xl dark:bg-white/[0.04]"
          data-no-window-drag
        >
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="text-[13px] font-[500] text-text-secondary">
              {t("player.eq_preset")}
            </span>
            <MenuSelect
              options={presetOptions}
              value={presetValue}
              onChange={selectPreset}
              align="start"
              aria-label={t("player.eq_preset")}
              className="w-[190px]"
            />

            <div className="flex-1" />

            {isNaming ? (
              <form
                className="flex items-center gap-[6px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  commitName();
                }}
              >
                <input
                  autoFocus
                  value={draftName}
                  maxLength={EQ_PRESET_NAME_MAX}
                  placeholder={t("player.eq_preset_name")}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={() => {
                    if (!draftName.trim()) setIsNaming(false);
                  }}
                  className={cn(
                    "h-[32px] w-[180px] rounded-[9px] border-0 px-[11px] text-[13px] font-[500] text-text-primary outline-none placeholder:text-text-tertiary",
                    HERO_GLASS_CLASS,
                  )}
                />
                <Button
                  type="submit"
                  variant="primary"
                  aria-label={t("player.eq_save_preset")}
                  disabled={!draftName.trim()}
                  className={`${HERO_BUTTON_CLASS} !w-[36px] !p-0`}
                >
                  <CheckLine size={16} />
                </Button>
              </form>
            ) : (
              <>
                {isManual && (
                  <Button
                    variant="secondary"
                    disabled={!canSaveMore}
                    onClick={() => setIsNaming(true)}
                    className={glassButtonClass}
                  >
                    {canSaveMore
                      ? t("player.eq_save_preset")
                      : t("player.eq_presets_full")}
                  </Button>
                )}
                {activeCustom && (
                  <Button
                    variant="secondary"
                    onClick={() => playerEngine.deleteEqPreset(activeCustom.id)}
                    className={glassButtonClass}
                  >
                    {t("player.eq_delete_preset")}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              disabled={isFlat}
              onClick={() => playerEngine.setEqGains(FLAT_EQ)}
              className={glassButtonClass}
            >
              {t("player.eq_reset")}
            </Button>
          </div>

          <div className="flex gap-[14px]">
            <div
              aria-hidden="true"
              className="relative w-[46px] shrink-0 text-right text-[12px] tabular-nums text-text-tertiary"
              style={{ height: PLOT_HEIGHT }}
            >
              <span className="absolute right-0 top-0 -translate-y-1/2 whitespace-nowrap">
                +{EQ_MAX_DB} dB
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap">
                0 dB
              </span>
              <span className="absolute right-0 top-full -translate-y-1/2 whitespace-nowrap">
                {EQ_MIN_DB} dB
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
              <div className="relative" style={{ height: PLOT_HEIGHT }}>
                {GRID_LINES.map((top) => (
                  <div
                    key={top}
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 h-px",
                      top === 50
                        ? "bg-black/[0.16] dark:bg-white/[0.2]"
                        : "bg-black/[0.06] dark:bg-white/[0.07]",
                    )}
                    style={{ top: `${top}%` }}
                  />
                ))}

                <svg
                  aria-hidden="true"
                  viewBox={`0 0 ${EQ_CURVE_WIDTH} ${PLOT_HEIGHT}`}
                  preserveAspectRatio="none"
                  className={cn(
                    "pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-colors duration-200",
                    isEqEnabled ? "text-accent-primary" : "text-text-tertiary",
                  )}
                >
                  <defs>
                    <linearGradient
                      id="eq-curve-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0"
                        stopColor="currentColor"
                        stopOpacity="0.38"
                      />
                      <stop
                        offset="1"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#eq-curve-fill)" />
                  <path
                    d={line}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {EQ_BANDS.map((frequency, i) => (
                  <CurvePoint
                    key={frequency}
                    frequency={frequency}
                    index={i}
                    value={eqGains[i] ?? 0}
                    onChange={(db) => setBand(i, db)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-10">
                {EQ_BANDS.map((frequency, i) => {
                  const value = eqGains[i] ?? 0;
                  return (
                    <div
                      key={frequency}
                      className="flex min-w-0 flex-col items-center gap-[2px]"
                    >
                      <span className="whitespace-nowrap text-[12px] text-text-tertiary">
                        {frequencyLabel(frequency)}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] font-[600] tabular-nums transition-colors",
                          Math.abs(value) > 0.01
                            ? "text-text-primary"
                            : "text-text-tertiary",
                        )}
                      >
                        {formatDb(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
