import Image from "next/image";
import ClientShell from "@/components/ClientShell";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

// ── SERVER DATA FETCHERS (run at build/revalidate time) ───────────────────────
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
      fetch( `${process.env.NEXT_PUBLIC_CMS_URL}/api/faqs` + `?where[published][equals]=true` + `&sort=order` + `&limit=100`, { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/stuff-posts?where[published][equals]=true&sort=order&limit=20&depth=2`, { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/buy-cards?where[published][equals]=true&sort=order&limit=20&depth=2`,   { next: { revalidate: 60 } }),
      fetch(`${CMS_URL}/api/email-phrases?where[published][equals]=true&sort=order&limit=30`,       { next: { revalidate: 60 } }),
    ]);
    return {
      faqs:         faqs?.ok        ? (await faqs.json()).docs         ?? [] : [],
      stuffPosts:   stuffPosts.ok   ? (await stuffPosts.json()).docs   ?? [] : [],
      buyCards:     buyCards.ok     ? (await buyCards.json()).docs     ?? [] : [],
      emailPhrases: emailPhrases.ok ? (await emailPhrases.json()).docs ?? [] : [],
    };
  } catch {
    return { faqs: [], stuffPosts: [], buyCards: [], emailPhrases: [] };
  }
}

function cmsImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${CMS_URL}${url}`;
}

// ── FALLBACK DATA (used when CMS collections are empty) ───────────────────────
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
const FALLBACK_STUFF = [
  { label: "Black Friday 2018",   tag: "Read", description: "Holy fuck we had some deals.",             href: "#", image: { url: "https://img.cah.io/images/vc07edlh/production/c1f921d8c8fd60969110124ebb20ad5d9878861c-1080x1080.png?auto=format&q=75&w=400" } },
  { label: "Science Scholarship", tag: "Read", description: "A full-tuition scholarship for women.",    href: "#", image: { url: "https://img.cah.io/images/vc07edlh/production/31fcc3f68a626462e5707bcc5ce19ee716f2e173-1080x1080.png?auto=format&q=75&w=400" } },
  { label: "Holiday Hole",        tag: "Read", description: "You paid us to dig a big hole.",           href: "#", image: { url: "https://img.cah.io/images/vc07edlh/production/1acdec5a623b0761a127ac03492b998879ead549-680x680.png?auto=format&q=75&w=400" } },
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

// Positions scattered around the edges matching the original site layout
const ICON_POS: React.CSSProperties[] = [
  { top: "10%",  left:  "2.5%" },
  { top: "10%",  left:  "15%"  },
  { top: "5%",   right: "15%"  },
  { top: "10%",  right: "2.5%" },
  { bottom: "10%", left:  "2.5%" },
  { bottom: "5%",  left:  "15%"  },
  { bottom: "5%",  right: "15%"  },
  { bottom: "10%", right: "2.5%" },
  { top: "50%",  left:  "1%",    transform: "translateY(-50%)" },
];

function AboutSection({ cmsHome }: { cmsHome: any }) {
  const p1 = cmsHome?.about?.paragraph1 || "is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.";
  const p2 = cmsHome?.about?.paragraph2 || "The game is simple. Each round, one player asks a question from a black card, and everyone else answers with their funniest white card.";

  return (
    <section className="bg-white relative h-[85vh] overflow-hidden" style={{ padding: "112px 48px" }}>
      {/* Real CAH icons scattered around the section */}
      {CAH_ICONS.map((icon, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ ...ICON_POS[i], opacity: 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon.src}
            alt=""
            width={icon.w * 1.4}
            height={icon.h * 1.4}
            loading="lazy"
            style={{ display: "block" }}
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto mt-16 text-center" style={{ maxWidth: 820 }}>
        <span
          className="text-black font-black leading-relaxed"
          style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.2 }}
        >
          {'Cards Against Humanity '}
        </span>
        <span
          className="text-black leading-relaxed"
          style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.5 }}
        >
          {p1}
        </span>
        <p
          className="text-black leading-relaxed"
          style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", lineHeight: 1.5 }}
        >
          {p2}
        </p>
      </div>
    </section>
  );
}

function StealSection({ cmsHome }: { cmsHome: any }) {
  const heading     = cmsHome?.stealSection?.heading     || "Steal the game.";
  const body        = cmsHome?.stealSection?.body        || "Since day one, Cards Against Humanity has been available as a free download. You can download the PDFs and printing instructions right here—all you need is a printer, scissors, and a prehensile appendage.";
  const body2       = cmsHome?.stealSection?.body2       || "Please note: there's no legal way to use these PDFs to make money, so don't ask.";
  const downloadUrl = cmsHome?.stealSection?.downloadUrl || "https://s3.amazonaws.com/cah/CAH_PrintAndPlay.pdf";
  const badgeTxt    = cmsHome?.stealSection?.badgeText   || "Free!\nDownload\nnow!";
  const size = 170, cx = size / 2, cy = size / 2, n = 16, oR = cx - 2, iR = cx - 13;
  let d = "";
  for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n - Math.PI / 2; const r = i % 2 ? iR : oR; d += (i ? "L" : "M") + `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }
  d += "Z";
  return (
    <section className="bg-white relative overflow-hidden" style={{ padding: "96px 48px" }}>
      <div className="absolute" style={{ top: 40, right: 60 }}>
        <div style={{ width: size, height: size, position: "relative" }}>
          <svg width={size} height={size} style={{ position: "absolute" }}><path d={d} fill="#b8f5b0" /></svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <span className="font-black text-center leading-tight whitespace-pre-line text-black" style={{ fontSize: 12 }}>{badgeTxt}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <h2 className="text-black font-black mb-8" style={{ fontSize: "clamp(2.8rem,6vw,4.5rem)", letterSpacing: "-0.03em" }}>{heading}</h2>
        <p className="text-black leading-relaxed mb-6" style={{ fontSize: "clamp(1.15rem,2vw,1.45rem)", lineHeight: 1.65 }}>{body}</p>
        <p className="text-black leading-relaxed mb-12" style={{ fontSize: "clamp(1.15rem,2vw,1.45rem)", lineHeight: 1.65 }}>{body2}</p>
        <div className="flex items-center gap-5 flex-wrap">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: "#e8503a", color: "white", fontWeight: 900, fontSize: "1.05rem", padding: "14px 52px 14px 24px", borderRadius: 6, clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 50%,calc(100% - 20px) 100%,0 100%)" }}>
              Download: Click here!
            </div>
          </a>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="font-black rounded-full"
            style={{ background: "#000", color: "white", padding: "14px 36px", fontSize: "1.1rem", textDecoration: "none" }}>
            Download Files
          </a>
        </div>
      </div>
    </section>
  );
}

function StuffSection({ cmsHome, stuffPosts }: { cmsHome: any; stuffPosts: any[] }) {
  const heading  = cmsHome?.stuffSection?.heading   || "Stuff we've done.";
  const badgeTxt = cmsHome?.stuffSection?.badgeText || "More to\ncome!";
  const posts = stuffPosts.length ? stuffPosts : FALLBACK_STUFF;
  const size = 96, cx = size / 2, cy = size / 2, n = 16, oR = cx - 2, iR = cx - 13;
  let d = "";
  for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n - Math.PI / 2; const r = i % 2 ? iR : oR; d += (i ? "L" : "M") + `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }
  d += "Z";
  return (
    <section className="bg-black" style={{ padding: "80px 48px" }}>
      <div className="flex items-start justify-between mb-10">
        <h2 className="text-white font-black" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "-0.02em" }}>{heading}</h2>
        <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
          <svg width={size} height={size} style={{ position: "absolute" }}><path d={d} fill="#ffffff" /></svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <span className="font-black text-center leading-tight whitespace-pre-line text-black" style={{ fontSize: 12 }}>{badgeTxt}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3" style={{ gap: 12 }}>
        {posts.map((post: any, i: number) => {
          const imgUrl = post.image?.url ? cmsImg(post.image.url) : null;
          return (
            <a key={post.id ?? i} href={post.href || "#"} style={{ textDecoration: "none", aspectRatio: "1/1", display: "block", position: "relative" }}
              className="rounded-2xl overflow-hidden group">
              {imgUrl && (
                <Image
                  src={imgUrl}
                  alt={post.label}
                  fill
                  unoptimized
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-white text-xs font-black tracking-[0.2em] uppercase opacity-60">{post.tag}</span>
                <p className="text-white font-black text-xl mt-1" style={{ fontFamily: "Georgia, serif" }}>{post.label}</p>
                <p className="text-white/75 mt-1" style={{ fontSize: "0.95rem" }}>{post.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function FooterSection({ cmsHome }: { cmsHome: any }) {
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
            {col.links.map((l: any) => (
              <a key={l.label} href={l.href || "#"} className="block text-black hover:opacity-60"
                style={{ fontSize: "1rem", textDecoration: "underline", marginBottom: 10 }}>{l.label}</a>
            ))}
          </div>
        ))}
        <div>
          <p className="font-black text-black mb-2" style={{ fontSize: "1rem" }}>Email List</p>
          <p className="text-black mb-5" style={{ fontSize: "1rem", lineHeight: 1.5 }}>Sign up and we&apos;ll let you know first when we do anything:</p>
          {/* Static form — no JS, no hydration cost */}
          <form className="flex items-center border-2 border-black rounded-lg overflow-hidden">
            <input type="email" name="email" placeholder="Email Address"
              className="flex-1 outline-none bg-white text-black placeholder-gray-400"
              style={{ padding: "12px 14px", fontSize: "0.95rem" }} />
            <button type="submit" className="flex items-center justify-center rounded-full border-2 text-black border-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
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
          {legalLinks.map((l: any) => (
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
  // Parallel server-side data fetch — runs at build/revalidate time
  const [cmsHome, { faqs, stuffPosts, buyCards, emailPhrases }] = await Promise.all([
    getCMSHome(),
    getCMSCollections(),
  ]);

  // Merge CMS data with fallbacks
  const quotes       = cmsHome?.hero?.quotes?.length ? cmsHome.hero.quotes       : FALLBACK_QUOTES;
  const phrases      = emailPhrases.length            ? emailPhrases              : FALLBACK_PHRASES.map(p => ({ phrase: p }));
  const faqItems     = faqs.length                    ? faqs                      : FALLBACK_FAQS;
  const buyCardItems = buyCards.length                ? buyCards                  : FALLBACK_BUY_CARDS;

  return (
    <main>
      <ClientShell
        cmsHome={cmsHome}
        quotes={quotes}
        buyCardItems={buyCardItems}
        phrases={phrases}
        faqItems={faqItems}
        aboutSlot={<AboutSection cmsHome={cmsHome} />}
        stealSlot={<StealSection cmsHome={cmsHome} />}
        stuffSlot={<StuffSection cmsHome={cmsHome} stuffPosts={stuffPosts} />}
        footerSlot={<FooterSection cmsHome={cmsHome} />}
      />
    </main>
  );
}