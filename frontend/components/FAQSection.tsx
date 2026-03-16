"use client";
import { useState } from "react";
import type { ElementType } from "react";

/* ══════════════════════════════════════════════════════════════════
   LEXICAL RICH TEXT RENDERER
   Payload stores answers as Lexical JSON. This renders it properly
   including paragraphs, bold, italic, underline, and links.
   ══════════════════════════════════════════════════════════════════ */
function RichText({ content }: { content: any }) {
  if (!content) return null;

  // If it's already a plain string, just render it
  if (typeof content === "string") {
    return <p style={{ margin: 0 }}>{content}</p>;
  }

  const root = content?.root ?? content;
  if (!root?.children) return null;

  function renderNode(node: any, idx: number): React.ReactNode {
    if (!node) return null;

    // ── Text leaf ──────────────────────────────────────────────────
    if (node.type === "text" || node.text !== undefined) {
      let el: React.ReactNode = node.text ?? "";
      if (node.format & 1)  el = <strong key={idx}>{el}</strong>;   // bold
      if (node.format & 2)  el = <em key={idx}>{el}</em>;            // italic
      if (node.format & 8)  el = <u key={idx}>{el}</u>;              // underline
      if (node.format & 16) el = <s key={idx}>{el}</s>;              // strikethrough
      if (node.format & 32) el = <code key={idx}>{el}</code>;        // code
      return el;
    }

    // ── Link ───────────────────────────────────────────────────────
    if (node.type === "link" || node.type === "autolink") {
      const href = node.fields?.url ?? node.url ?? "#";
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {node.children?.map(renderNode)}
        </a>
      );
    }

    // ── Paragraph ─────────────────────────────────────────────────
    if (node.type === "paragraph") {
      const isEmpty = !node.children?.length ||
        (node.children.length === 1 && node.children[0].text === "");
      if (isEmpty) return <br key={idx} />;
      return (
        <p key={idx} style={{ margin: "0 0 0.9em 0", lineHeight: 1.65 }}>
          {node.children?.map(renderNode)}
        </p>
      );
    }

    // ── Headings ──────────────────────────────────────────────────
    if (node.type === "heading") {
      const Tag = (node.tag ?? "h3") as ElementType;
      return (
        <Tag key={idx} style={{ margin: "0.5em 0", fontWeight: 900 }}>
          {node.children?.map(renderNode)}
        </Tag>
      );
    }

    // ── Lists ─────────────────────────────────────────────────────
    if (node.type === "list") {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return (
        <Tag key={idx} style={{ paddingLeft: "1.4em", margin: "0.4em 0" }}>
          {node.children?.map(renderNode)}
        </Tag>
      );
    }
    if (node.type === "listitem") {
      return <li key={idx}>{node.children?.map(renderNode)}</li>;
    }

    // ── Fallback: recurse into children ───────────────────────────
    if (node.children?.length) {
      return <span key={idx}>{node.children.map(renderNode)}</span>;
    }

    return null;
  }

  return (
    <div style={{ margin: 0 }}>
      {root.children.map((node: any, i: number) => renderNode(node, i))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FAQ SECTION
   ══════════════════════════════════════════════════════════════════ */
interface FAQ {
  id?: string;
  question: string;
  answer: any;   // Lexical JSON or plain string
  order?: number;
  published?: boolean;
}

interface FAQSectionProps {
  heading?: string;
  faqs: FAQ[];   // No fallback — receives real CMS data only
}

export default function FAQSection({ heading, faqs }: FAQSectionProps) {
  const [openIdx, setOpenIdx]   = useState<number | null>(null);
  const [allOpen, setAllOpen]   = useState(false);

  // Sort by order asc (CMS already sorts, but belt-and-suspenders)
  const sorted = [...faqs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const toggle = (i: number) => {
    if (allOpen) {
      // Exit "expand all" mode, close everything except clicked
      setAllOpen(false);
      setOpenIdx(i);
    } else {
      setOpenIdx(prev => (prev === i ? null : i));
    }
  };

  const isOpen = (i: number) => allOpen || openIdx === i;

  if (!sorted.length) return null;

  return (
    <section
      className="bg-black"
      style={{
        padding: "clamp(48px,7vw,110px) clamp(18px,5vw,72px)",
      }}
    >
      {/* ── Header row ── */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        style={{ marginBottom: "clamp(32px,5vw,64px)", gap: 24 }}
      >
        <h2
          className="text-white font-black"
          style={{
            fontFamily:    "Georgia, 'Times New Roman', serif",
            fontSize:      "clamp(2.4rem,6vw,5.4rem)",   // responsive downscale for mobile
            letterSpacing: "-0.03em",
            lineHeight:    1.05,
            margin:        0,
          }}
        >
          {heading ?? "Your dumb questions."}
        </h2>

        <button
          onClick={() => { setAllOpen(o => !o); setOpenIdx(null); }}
          className="flex-shrink-0 font-black bg-white text-black hover:bg-gray-100 transition-colors w-full sm:w-auto"
          style={{
            borderRadius:  9999,
            padding:       "clamp(12px,1.2vw,16px) clamp(20px,2.1vw,32px)",
            fontSize:      "clamp(14px,1.1vw,16px)",
            fontFamily:    "Helvetica Neue, Arial Black, sans-serif",
            border:        "none",
            cursor:        "pointer",
            marginTop:     4,   // slight optical alignment with text cap-height
            whiteSpace:    "nowrap",
          }}
        >
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* ── Accordion list ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}>
        {sorted.map((faq, i) => {
          const open = isOpen(i);
          return (
            <div
              key={faq.id ?? i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.18)" }}
            >
              {/* Question row */}
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => toggle(i)}
                style={{
                  padding:    "clamp(20px,2.5vw,32px) 0",
                  gap:        24,
                  background: "none",
                  border:     "none",
                  cursor:     "pointer",
                  width:      "100%",
                }}
              >
                <span
                  className="text-white font-black"
                  style={{
                    fontFamily:    "Georgia, 'Times New Roman', serif",
                    fontSize:      "clamp(1.4rem,2.4vw,2.2rem)",   // large question text
                    lineHeight:    1.3,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {faq.question}
                </span>

                {/* + / × icon — matches reference exactly */}
                <span
                  className="text-white font-black flex-shrink-0"
                  style={{
                    fontSize:   "clamp(1.6rem,2vw,2.2rem)",
                    lineHeight: 1,
                    // rotate + into × when open
                    transform:  open ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    display:    "block",
                  }}
                >
                  +
                </span>
              </button>

              {/* Answer — smooth height transition via grid trick */}
              <div
                style={{
                  display:        "grid",
                  gridTemplateRows: open ? "1fr" : "0fr",
                  transition:     "grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div
                    className="text-gray-300"
                    style={{
                      padding:       `0 0 clamp(20px,2.5vw,36px) 0`,
                      fontSize:      "clamp(1rem,1.4vw,1.25rem)",
                      lineHeight:    1.7,
                      fontFamily:    "Helvetica Neue, Arial, sans-serif",
                      maxWidth:      "72ch",
                    }}
                  >
                    <RichText content={faq.answer} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}