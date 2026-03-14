import ClientShell from "@/components/ClientShell";
import StuffSection from "../components/StuffSection";
import StealSectionClient from "@/components/StealSection";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

type FooterLink = { label: string; href?: string };
type CMSHome = {
  hero?: { quotes?: { quote?: string; source?: string }[] };
  about?: { paragraph1?: string; paragraph2?: string };
  buySection?: { heading?: string };
  emailSection?: {
    headingPrefix?: string;
    headingSuffix?: string;
    disclaimer?: string;
    placeholder?: string;
  };
  faqSection?: { heading?: string };
  footer?: {
    copyright?: string;
    shopLinks?: FooterLink[];
    infoLinks?: FooterLink[];
    findUsLinks?: FooterLink[];
    legalLinks?: FooterLink[];
  };
};

// ── SERVER DATA FETCHERS ───────────────────────────────────────────────────────
async function getCMSHome() {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/home-page?depth=2`, {
      next: { revalidate: 60 },
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function getCMSCollections() {
  try {
    const [faqs, stuffPosts, buyCards, emailPhrases] = await Promise.all([
      fetch(`${CMS_URL}/api/faqs?where[published][equals]=true&sort=order&limit=100`,          { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/stuff-posts?where[published][equals]=true&sort=order&limit=20&depth=2`, { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/buy-cards?where[published][equals]=true&sort=order&limit=20&depth=2`,   { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/email-phrases?where[published][equals]=true&sort=order&limit=30`,       { next: { revalidate: 60 } }),
    ]);
    return {
      faqs:         faqs.ok         ? (await faqs.json()).docs         ?? [] : [],
      stuffPosts:   stuffPosts.ok   ? (await stuffPosts.json()).docs   ?? [] : [],
      buyCards:     buyCards.ok     ? (await buyCards.json()).docs     ?? [] : [],
      emailPhrases: emailPhrases.ok ? (await emailPhrases.json()).docs ?? [] : [],
    };
  } catch {
    return { faqs: [], stuffPosts: [], buyCards: [], emailPhrases: [] };
  }
}

// ── FALLBACK DATA ──────────────────────────────────────────────────────────────
const FALLBACK_QUOTES = [
  { quote: '"Bad."',        source: "NPR" },
  { quote: '"Stupid."',     source: "Bloomberg" },
  { quote: '"Hysterical."', source: "TIME" },
  { quote: '"Wrong."',      source: "Washington Post" },
];
const FALLBACK_PHRASES = [
  "we chop up a Picasso,", "we buy a private island,", "we launch a satellite,",
  "we invent a new color,", "we declare war on Denmark,", "we eat the last panda,",
];
const FALLBACK_FAQS = [
  { question: "Where can I buy Cards Against Humanity?", answer: "Our products are available all over the place, such as our webstore, Amazon, and at all of these retailers." },
  { question: "Can I still buy it even if I'm not in America?", answer: "We make localized versions for Canada, Australia, and the UK, plus a whole special \"International Edition\" devoid of any exciting country-specific jokes." },
  { question: "How do I play Cards Against Humanity?", answer: "Each round, one player asks a question with a black card, and everyone else answers with their funniest white card." },
  { question: "Do you sell expansions?", answer: "Yes! We sell large boxed expansions, dozens of small themed packs, plus a few accessories and other bullshit." },
  { question: "I bought something from you and now there's a problem.", answer: "Take a deep breath. Contemplate the transience of all things.\n\nThen go to our webstore FAQ, and if that doesn't help, send us an email at Mail@CardsAgainstHumanity.com." },
  { question: "Can I sell Cards Against Humanity in my store?", answer: "Maybe! Email Retail@CardsAgainstHumanity.com for more information." },
  { question: "Are the expansions available as free downloads like the main game?", answer: "No. We need to make money somehow." },
  { question: "Do you make a version for families and kids?", answer: "Yes, and it's mostly fart jokes. Check out Cards Against Humanity: Family Edition." },
  { question: "Is Cards Against Humanity the same as when it first came out?", answer: "Absolutely. We rewrite huge swaths of the game every year. The latest edition is 2.3." },
  { question: "Can I play Cards Against Humanity online?", answer: "You can help us test new cards at the Cards Against Humanity Lab, or play at Pretend You're Xyzzy." },
  { question: "Can I make my own Cards Against Humanity?", answer: "No! We legally own the name, design, slogan, logos, and all writing. You need a license from us." },
  { question: "Do you want my card ideas?", answer: "No. But you can submit them anonymously here. We promise never to look at them." },
  { question: "Cards Against Humanity is racist/sexist/homophobic.", answer: "So are we. It's pretty fucked up!" },
  { question: "Do you need my help making an expansion?", answer: "We're way too busy. Check out Your Dumb Jokes — 50 blank cards.\n\nNote: this policy does not apply to Hugh Jackman." },
  { question: "Can I start my own Cards Against Humanity game night?", answer: "You don't need the help of Cards Against Humanity LLC to do this." },
  { question: "Do you own land?", answer: "We did. It's in Maine." },
  { question: "Whatever happened to Prongles?", answer: "We launched Original Prongles. It was a financial catastrophe, so now we're back to card games." },
  { question: "Whatever happened to the Cards Against Humanity TV show?", answer: "Also a financial catastrophe." },
  { question: "I love you.", answer: "I love you, too." },
];
const FALLBACK_BUY_CARDS = [
  { label: "America's #1\ngerbil coffin.",  cta: "Buy Now",           href: "/products/more-cah", backgroundColor: "#87CEEB", darkBackground: false },
  { label: "Play CAH\nwith your kids.",     cta: "Buy Family Edition", href: "#",                  backgroundColor: "#FFE135", darkBackground: false },
  { label: "Moooooore\ncards!",             cta: "Buy Expansions",     href: "#",                  backgroundColor: "#FFB3D9", darkBackground: false },
  { label: "For whatever\nyou're into.",    cta: "Buy $5 Packs",       href: "#",                  backgroundColor: "#90EE90", darkBackground: false },
  { label: "What is\nthis stuff?",          cta: "Find Out",           href: "#",                  backgroundColor: "#111111", darkBackground: true  },
];

const CAH_ICONS = [
  { src: "https://img.cah.io/images/vc07edlh/production/410d7640a35a6d1c6b1c5532a8865ce9566f7aef-38x38.svg", w: 28, h: 28 },
  { src: "https://img.cah.io/images/vc07edlh/production/7755ab953426b92bcee84da84db54d73c90fdb82-38x36.svg", w: 28, h: 26 },
  { src: "https://img.cah.io/images/vc07edlh/production/844969c83be9f4736138e20b1f5160624c32b27d-38x37.svg", w: 28, h: 27 },
  { src: "https://img.cah.io/images/vc07edlh/production/4e31f1365aac66e92504f15c4b0dc6fed6c35467-37x37.svg", w: 27, h: 27 },
  { src: "https://img.cah.io/images/vc07edlh/production/99b5ad3a812bbfd8b22aa17a2e2b09ed714007ec-38x38.svg", w: 28, h: 28 },
  { src: "https://img.cah.io/images/vc07edlh/production/c3ad2ad955dc7d6d78dab0538a95c326ba540e3b-38x38.svg", w: 28, h: 28 },
  { src: "https://img.cah.io/images/vc07edlh/production/2b4022e0540298d890c5c014a48962dda608b599-37x37.svg", w: 27, h: 27 },
  { src: "https://img.cah.io/images/vc07edlh/production/5c65c30fc763b717a6aeb4e3e31396dc1eff25cb-37x37.svg", w: 27, h: 27 },
  { src: "https://img.cah.io/images/vc07edlh/production/dcd9c155e28ce85538e4ee426bdac4c189e4bd3f-38x36.svg", w: 28, h: 26 },
];
const ICON_POS: React.CSSProperties[] = [
  { top: "10%",  left:  "2.5%" },
  { top: "10%",  left:  "15%"  },
  { top: "5%",   right: "15%"  },
  { top: "10%",  right: "2.5%" },
  { bottom: "10%", left:  "2.5%" },
  { bottom: "5%",  left:  "15%"  },
  { bottom: "5%",  right: "15%"  },
  { bottom: "10%", right: "2.5%" },
  { top: "50%",  left:  "1%", transform: "translateY(-50%)" },
];

// ── SERVER-ONLY SECTIONS (no interactivity needed) ────────────────────────────

function AboutSection({ cmsHome }: { cmsHome: CMSHome | null }) {
  const p1 = cmsHome?.about?.paragraph1 || "is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.";
  const p2 = cmsHome?.about?.paragraph2 || "The game is simple. Each round, one player asks a question from a black card, and everyone else answers with their funniest white card.";
  return (
    <section className="bg-white relative h-[85vh] overflow-hidden" style={{ padding: "112px 48px" }}>
      {CAH_ICONS.map((icon, i) => (
        <div key={i} className="absolute pointer-events-none select-none" style={{ ...ICON_POS[i], opacity: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon.src} alt="" width={icon.w * 1.4} height={icon.h * 1.4} loading="lazy" style={{ display: "block" }} />
        </div>
      ))}
      <div className="relative z-10 mx-auto mt-16 text-center" style={{ maxWidth: 820 }}>
        <span className="text-black font-black leading-relaxed" style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.2 }}>
          {"Cards Against Humanity "}
        </span>
        <span className="text-black leading-relaxed" style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.5 }}>{p1}</span>
        <p className="text-black leading-relaxed" style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.5 }}>{p2}</p>
      </div>
    </section>
  );
}

function FooterSection({ cmsHome }: { cmsHome: CMSHome | null }) {
  const copyright  = cmsHome?.footer?.copyright  || "©2026 Cards Against Humanity LLC";
  const shopLinks  = cmsHome?.footer?.shopLinks  || [{ label: "All Products", href: "#" },{ label: "Main Games", href: "#" },{ label: "Expansions", href: "#" },{ label: "Family", href: "#" },{ label: "Packs", href: "#" },{ label: "Other Stuff", href: "#" }];
  const infoLinks  = cmsHome?.footer?.infoLinks  || [{ label: "About", href: "#" },{ label: "Support", href: "#" },{ label: "Contact", href: "#" },{ label: "Retailers", href: "#" },{ label: "Steal", href: "#" },{ label: "Careers", href: "#" }];
  const findUs     = cmsHome?.footer?.findUsLinks|| [{ label: "Facebook", href: "#" },{ label: "Instagram", href: "#" },{ label: "TikTok", href: "#" },{ label: "Bluesky", href: "#" },{ label: "Amazon", href: "#" },{ label: "Target", href: "#" }];
  const legalLinks = cmsHome?.footer?.legalLinks || [{ label: "Terms of Use", href: "#" },{ label: "Privacy Policy", href: "#" },{ label: "Submission Terms", href: "#" },{ label: "Cookie Preferences", href: "#" }];
  const cols = [{ heading: "Shop", links: shopLinks },{ heading: "Info", links: infoLinks },{ heading: "Find Us", links: findUs }];
  return (
    <footer className="bg-white" style={{ padding: "80px 48px 40px" }}>
      <div className="grid mb-12" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr", gap: "0 48px" }}>
        <p className="text-black font-black leading-tight" style={{ fontFamily: "Georgia, serif", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Cards<br />Against<br />Humanity
        </p>
        {cols.map(col => (
          <div key={col.heading}>
            <p className="font-black text-black mb-5" style={{ fontSize: "1rem" }}>{col.heading}</p>
            {col.links.map((l: FooterLink) => (
              <a key={l.label} href={l.href || "#"} className="block text-black hover:opacity-60"
                style={{ fontSize: "1rem", textDecoration: "underline", marginBottom: 10 }}>{l.label}</a>
            ))}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2" style={{ fontSize: "1rem" }}>Email List</p>
          <p className="text-black mb-5" style={{ fontSize: "1rem", lineHeight: 1.5 }}>Sign up and we&apos;ll let you know first when we do anything:</p>
          <form className="flex items-center border-2 border-black rounded-lg overflow-hidden">
            <input type="email" name="email" placeholder="Email Address"
              className="flex-1 outline-none bg-white text-black placeholder-gray-400"
              style={{ padding: "12px 14px", fontSize: "0.95rem" }} />
            <button type="submit" className="flex items-center justify-center rounded-full border-2 text-black border-black hover:bg-black hover:text-white transition-colors shrink-0"
              style={{ width: 36, height: 36, margin: "0 6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap" style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 24, gap: 16 }}>
        <span className="flex items-center gap-1 border border-black rounded-full font-black text-black" style={{ padding: "7px 16px", fontSize: "0.95rem" }}>
          India <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
        </span>
        <div className="flex gap-6 flex-wrap">
          {legalLinks.map((l: FooterLink) => (
            <a key={l.label} href={l.href || "#"} className="text-black hover:underline" style={{ fontSize: "0.95rem" }}>{l.label}</a>
          ))}
        </div>
        <p className="text-black" style={{ fontSize: "0.95rem" }}>{copyright}</p>
      </div>
    </footer>
  );
}

// ── ROOT SERVER PAGE ───────────────────────────────────────────────────────────
export default async function Home() {
  const [cmsHome, { faqs, stuffPosts, buyCards, emailPhrases }] = await Promise.all([
    getCMSHome(),
    getCMSCollections(),
  ]);

  const quotes       = cmsHome?.hero?.quotes?.length ? cmsHome.hero.quotes : FALLBACK_QUOTES;
  const phrases      = emailPhrases.length ? emailPhrases : FALLBACK_PHRASES.map(p => ({ phrase: p }));
  const faqItems     = faqs.length         ? faqs         : FALLBACK_FAQS;
  const buyCardItems = buyCards.length     ? buyCards     : FALLBACK_BUY_CARDS;

  return (
    <main>
      <ClientShell
        cmsHome={cmsHome}
        quotes={quotes}
        buyCardItems={buyCardItems}
        phrases={phrases}
        faqItems={faqItems}
        aboutSlot={<AboutSection key="about-slot" cmsHome={cmsHome} />}
        stealSlot={<StealSectionClient key="steal-slot" cmsHome={cmsHome} />}
        stuffSlot={
          <StuffSection
            key="stuff-slot"
            cmsHome={cmsHome}
            stuffPosts={stuffPosts}
          />
        }
        footerSlot={<FooterSection key="footer-slot" cmsHome={cmsHome} />}
      />
    </main>
  );
}