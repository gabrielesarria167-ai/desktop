import { memo } from "react";
import { SidebarNavItems } from "./SidebarNavItems";
import { SidebarSettingsButton } from "./SidebarSettingsButton";

export interface SidebarProps {
  searchOpen: boolean;
  onSearchToggle: () => void;
}

function Sidebar({ searchOpen, onSearchToggle }: SidebarProps) {
  return (
    <div
      className="h-full w-[240px] rounded-xl flex flex-col overflow-hidden border-none liner-glass"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <nav className="flex-1 min-h-0 flex flex-col gap-[2px] overflow-y-auto px-[10px] pt-[10px] pb-[10px]">
        <SidebarNavItems
          searchOpen={searchOpen}
          onSearchToggle={onSearchToggle}
        />
      </nav>

      <div className="shrink-0 px-[10px] pt-[6px] pb-[10px]">
        <SidebarSettingsButton />
      </div>
    </div>
  );
}

export default memo(Sidebar);
