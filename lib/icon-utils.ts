import * as simpleIcons from "simple-icons";

// Popular subscription services with their Simple Icons identifiers
export const POPULAR_APPS = [
  // Streaming Services
  { id: "netflix", name: "Netflix" },
  { id: "spotify", name: "Spotify" },
  { id: "applemusic", name: "Apple Music" },
  { id: "appletv", name: "Apple TV+" },
  { id: "icloud", name: "iCloud" },
  { id: "youtube", name: "YouTube Premium" },
  { id: "hbomax", name: "HBO Max" },
  { id: "paramountplus", name: "Paramount+" },
  { id: "crunchyroll", name: "Crunchyroll" },
  { id: "tidal", name: "Tidal" },
  { id: "soundcloud", name: "SoundCloud" },
  { id: "pandora", name: "Pandora" },
  { id: "shazam", name: "Shazam" },
  // Software & Productivity
  { id: "adobe", name: "Adobe Creative Cloud" },
  { id: "microsoft", name: "Microsoft 365" },
  { id: "google", name: "Google Workspace" },
  { id: "dropbox", name: "Dropbox" },
  { id: "github", name: "GitHub" },
  { id: "notion", name: "Notion" },
  { id: "figma", name: "Figma" },
  { id: "slack", name: "Slack" },
  { id: "zoom", name: "Zoom" },
  { id: "canva", name: "Canva" },
  { id: "grammarly", name: "Grammarly" },
  { id: "todoist", name: "Todoist" },
  { id: "evernote", name: "Evernote" },
  { id: "asana", name: "Asana" },
  { id: "jira", name: "Jira" },
  { id: "vercel", name: "Vercel" },
  { id: "aws", name: "AWS" },
  // Social & Communication
  { id: "discord", name: "Discord" },
  { id: "twitch", name: "Twitch" },
  { id: "tiktok", name: "TikTok" },
  { id: "snapchat", name: "Snapchat" },
  { id: "telegram", name: "Telegram" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "signal", name: "Signal" },
  // Gaming
  { id: "xbox", name: "Xbox Game Pass" },
  { id: "playstation", name: "PlayStation Plus" },
  { id: "nintendo", name: "Nintendo Switch Online" },
  { id: "steam", name: "Steam" },
  // Security & VPN
  { id: "nordvpn", name: "NordVPN" },
  { id: "protonmail", name: "ProtonMail" },
  { id: "1password", name: "1Password" },
  { id: "lastpass", name: "LastPass" },
  { id: "bitwarden", name: "Bitwarden" },
  // Food & Delivery
  { id: "uber", name: "Uber Pass" },
  { id: "doordash", name: "DoorDash" },
  { id: "instacart", name: "Instacart" },
  // Other
  { id: "audible", name: "Audible" },
  { id: "medium", name: "Medium" },
  { id: "airbnb", name: "Airbnb" },
] as const;

export type PopularAppId = (typeof POPULAR_APPS)[number]["id"];

/**
 * Get SVG data for a Simple Icon by its identifier
 * @param iconId - Simple Icons identifier (e.g., "netflix", "spotify")
 * @returns SVG path data and hex color, or null if not found
 */
export function getIconData(iconId: string | null | undefined) {
  if (!iconId) return null;

  try {
    const normalizedId = iconId.toLowerCase().trim();

    const variations = [
      normalizedId,
      normalizedId.replace(/plus/g, "plus"),
      normalizedId.replace(/plus/g, ""),
      normalizedId.replace(/\s+/g, ""),
      normalizedId.replace(/\s+/g, "-"),
    ];

    for (const variant of variations) {
      const pascalCase = variant
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      const iconKey = `si${pascalCase}`;

      // @ts-expect-error - simple-icons uses dynamic keys
      const icon = simpleIcons[iconKey];

      if (icon) {
        return {
          path: icon.path,
          hex: icon.hex,
          title: icon.title,
        };
      }
    }

    console.warn(
      `Icon not found for identifier: ${iconId} (tried variations: ${variations.join(
        ", "
      )})`
    );
    return null;
  } catch (error) {
    console.error(`Error getting icon for ${iconId}:`, error);
    return null;
  }
}

export function getIconSvg(
  iconId: string | null | undefined,
  size: number = 24
): string | null {
  const iconData = getIconData(iconId);
  if (!iconData) return null;

  return `<svg role="img" viewBox="0 0 24 24" width="${size}" height="${size}" fill="#${iconData.hex}" xmlns="http://www.w3.org/2000/svg"><title>${iconData.title}</title><path d="${iconData.path}"/></svg>`;
}
