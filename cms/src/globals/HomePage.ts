import { GlobalConfig } from 'payload'

const HomePage: GlobalConfig = {
  slug: 'home-page',
  admin: {
    description: 'Controls all text content on the homepage. FAQs, Buy Cards, Stuff Posts, and Email Phrases are managed in their own Collections.',
  },
  access: { read: () => true },
  fields: [
    // ── Hero ─────────────────────────────────────────────────────────────────
    {
      name: 'hero',
      type: 'group',
      admin: { description: 'Hero section — the full-screen card animation.' },
      fields: [
        {
          name: 'quotes',
          type: 'array',
          admin: { description: 'Rotating press quotes shown bottom-left of the hero. They cycle with the card sets.' },
          fields: [
            { name: 'quote', type: 'text', required: true, admin: { description: 'Include quotes. E.g. "Hysterical."' } },
            { name: 'source', type: 'text', required: true, admin: { description: 'Publication name. E.g. TIME' } },
          ],
          defaultValue: [
            { quote: '"Bad."', source: 'NPR' },
            { quote: '"Stupid."', source: 'Bloomberg' },
            { quote: '"Hysterical."', source: 'TIME' },
            { quote: '"Wrong."', source: 'Washington Post' },
          ],
        },
      ],
    },

    // ── About ─────────────────────────────────────────────────────────────────
    {
      name: 'about',
      type: 'group',
      admin: { description: 'The white "about" section below the hero.' },
      fields: [
        {
          name: 'paragraph1',
          type: 'textarea',
          defaultValue: 'Cards Against Humanity is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.',
          admin: { description: 'Large bold paragraph — the main description.' },
        },
        {
          name: 'paragraph2',
          type: 'textarea',
          defaultValue: 'The game is simple. Each round, one player asks a question from a black card, and everyone else answers with their funniest white card.',
          admin: { description: 'Smaller second paragraph.' },
        },
      ],
    },

    // ── Buy Section ───────────────────────────────────────────────────────────
    {
      name: 'buySection',
      type: 'group',
      admin: { description: 'The "Buy the game." scroll section heading. Cards are managed in the Buy Cards collection.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Buy the game.', required: true },
      ],
    },

    // ── Steal ─────────────────────────────────────────────────────────────────
    {
      name: 'stealSection',
      type: 'group',
      admin: { description: 'The white "Steal the game." section.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Steal the game.', required: true },
        {
          name: 'body',
          type: 'textarea',
          defaultValue: 'Since day one, Cards Against Humanity has been available as a free download on our website. You can download the PDFs and printing instructions right here—all you need is a printer, scissors, and a prehensile appendage.',
          admin: { description: 'First paragraph body text.' },
        },
        {
          name: 'body2',
          type: 'textarea',
          defaultValue: "Please note: there's no legal way to use these PDFs to make money, so don't ask.",
          admin: { description: 'Second paragraph (the disclaimer).' },
        },
        {
          name: 'downloadUrl',
          type: 'text',
          defaultValue: 'https://s3.amazonaws.com/cah/CAH_PrintAndPlay.pdf',
          admin: { description: 'PDF download URL for both buttons.' },
        },
        {
          name: 'badgeText',
          type: 'text',
          defaultValue: 'Free!\nDownload\nnow!',
          admin: { description: 'Text inside the starburst badge. Use \\n for line breaks.' },
        },
      ],
    },

    // ── Stuff Section ─────────────────────────────────────────────────────────
    {
      name: 'stuffSection',
      type: 'group',
      admin: { description: 'The dark "Stuff we\'ve done." section. Cards are managed in the Stuff Posts collection.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: "Stuff we've done.", required: true },
        {
          name: 'badgeText',
          type: 'text',
          defaultValue: 'More to\ncome!',
          admin: { description: 'Text inside the starburst badge top-right of the section.' },
        },
      ],
    },

    // ── Email ─────────────────────────────────────────────────────────────────
    {
      name: 'emailSection',
      type: 'group',
      admin: { description: 'The email sign-up section. Rotating phrases are managed in the Email Phrases collection.' },
      fields: [
        {
          name: 'headingPrefix',
          type: 'text',
          defaultValue: 'To find out first when',
          admin: { description: 'Text before the rotating phrase.' },
        },
        {
          name: 'headingSuffix',
          type: 'text',
          defaultValue: 'give us your email:',
          admin: { description: 'Text after the rotating phrase.' },
        },
        {
          name: 'disclaimer',
          type: 'text',
          defaultValue: "We'll only email you like twice a year and we won't share your info with anybody else.",
        },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Email Address',
          admin: { description: 'Placeholder text in the email input box.' },
        },
      ],
    },

    // ── FAQ Section ───────────────────────────────────────────────────────────
    {
      name: 'faqSection',
      type: 'group',
      admin: { description: 'FAQ section settings. Individual questions are managed in the FAQs collection.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Your dumb questions.', required: true },
      ],
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    {
      name: 'footer',
      type: 'group',
      admin: { description: 'Footer content.' },
      fields: [
        { name: 'copyright', type: 'text', defaultValue: '©2026 Cards Against Humanity LLC' },
        {
          name: 'shopLinks',
          type: 'array',
          admin: { description: 'Links in the Shop column.' },
          defaultValue: [
            { label: 'All Products', href: '#' }, { label: 'Main Games', href: '#' },
            { label: 'Expansions', href: '#' },   { label: 'Family', href: '#' },
            { label: 'Packs', href: '#' },         { label: 'Other Stuff', href: '#' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', defaultValue: '#' },
          ],
        },
        {
          name: 'infoLinks',
          type: 'array',
          admin: { description: 'Links in the Info column.' },
          defaultValue: [
            { label: 'About', href: '#' },   { label: 'Support', href: '#' },
            { label: 'Contact', href: '#' }, { label: 'Retailers', href: '#' },
            { label: 'Steal', href: '#' },   { label: 'Careers', href: '#' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', defaultValue: '#' },
          ],
        },
        {
          name: 'findUsLinks',
          type: 'array',
          admin: { description: 'Links in the Find Us column.' },
          defaultValue: [
            { label: 'Facebook', href: '#' },  { label: 'Instagram', href: '#' },
            { label: 'TikTok', href: '#' },    { label: 'Bluesky', href: '#' },
            { label: 'Amazon', href: '#' },    { label: 'Target', href: '#' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', defaultValue: '#' },
          ],
        },
        {
          name: 'legalLinks',
          type: 'array',
          admin: { description: 'Legal links in the footer bottom bar.' },
          defaultValue: [
            { label: 'Terms of Use', href: '#' }, { label: 'Privacy Policy', href: '#' },
            { label: 'Submission Terms', href: '#' }, { label: 'Cookie Preferences', href: '#' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', defaultValue: '#' },
          ],
        },
      ],
    },
  ],
}

export default HomePage