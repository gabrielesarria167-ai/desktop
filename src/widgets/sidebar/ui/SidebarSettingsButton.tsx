import { sidebarNavItems } from "@/features/navigation/data/navigation";
import { useTranslation } from "@/languages";
import { useModalStore } from "@/features/library";
import { useAuthStore } from "@/features/auth";
import { userDisplayName } from "@/entities/user";
import { UserAvatar } from "@/shared/ui";
import { cn } from "@/shared/lib";

// the account row at the foot of the sidebar: it opens settings, where the account lives
export function SidebarSettingsButton() {
  const { t } = useTranslation();
  const settingsOpen = useModalStore((state) => state.settingsOpen);
  const toggleSettings = useModalStore((state) => state.toggleSettings);
  const user = useAuthStore((state) => state.user);

  const settingsItem = sidebarNavItems.find((item) => item.id === "settings");
  if (!settingsItem) return null;

  const Icon =
    settingsOpen && settingsItem.ActiveIcon
      ? settingsItem.ActiveIcon
      : settingsItem.Icon;
  const label = t("common.sidebar.settings");

  return (
    <button
      type="button"
      aria-pressed={settingsOpen}
      aria-label={label}
      title={label}
      onClick={toggleSettings}
      className={cn(
        "group flex h-[44px] w-full items-center gap-[10px] rounded-[10px] border-0 px-[8px] text-left cursor-pointer select-none transition-colors duration-150 active:scale-[0.99]",
        settingsOpen
          ? "bg-black/[0.06] dark:bg-white/[0.1]"
          : "bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
      )}
    >
      <UserAvatar user={user ?? null} size={28} className="!rounded-full" />
      <span className="min-w-0 flex-1 truncate text-[14px] font-[500] text-text-primary">
        {userDisplayName(user) ?? "Liner"}
      </span>
      <Icon
        size={18}
        className={cn(
          "shrink-0 text-text-primary transition-opacity duration-150 ease-out",
          settingsOpen ? "opacity-100" : "opacity-55 group-hover:opacity-90",
        )}
      />
    </button>
  );
}
