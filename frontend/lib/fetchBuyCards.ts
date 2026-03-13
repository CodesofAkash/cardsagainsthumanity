export type CMSImageEntry = {
  image?: { url?: string } | null;
  top?: string;
  right?: string;
  width?: string;
  rotation?: number;
  zIndex?: number;
};

export type CMSBuyCard = {
  id: string;
  label: string;
  cta: string;
  href?: string;
  backgroundColor: string;
  darkBackground?: boolean;
  images?: CMSImageEntry[];
  order?: number;
  published?: boolean;
};

export async function fetchBuyCards(cmsUrl: string): Promise<CMSBuyCard[]> {
  try {
    const res = await fetch(
      // sort ascending by order, only published cards, limit 20
      `${cmsUrl}/api/buy-cards?where[published][equals]=true&sort=order&limit=20`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []) as CMSBuyCard[];
  } catch {
    return [];
  }
}