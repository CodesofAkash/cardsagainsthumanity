import { CollectionConfig } from 'payload'

const BuyCards: CollectionConfig = {
  slug: 'buy-cards',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'cta', 'order', 'published', 'updatedAt'],
    description: 'Cards in the "Buy it now" horizontal scroll. Each card has floating product images, headline text and a CTA button.',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // ── Content ─────────────────────────────────────────────────────────────
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Main headline. Use \\n for line breaks. E.g. "For whatever\\nyou\'re into."',
      },
    },
    {
      name: 'cta',
      type: 'text',
      required: true,
      defaultValue: 'Buy Now',
      admin: {
        description: 'Button label. E.g. "Buy $5 Packs", "Find Out", "Buy Now"',
      },
    },
    {
      name: 'href',
      type: 'text',
      defaultValue: '#',
      admin: {
        description: 'Link for the entire card and button. E.g. /products/hot-box',
      },
    },

    // ── Appearance ───────────────────────────────────────────────────────────
    {
      name: 'backgroundColor',
      type: 'text',
      required: true,
      defaultValue: '#90EE90',
      admin: {
        description: 'Card background color (hex or CSS color). E.g. #FFB3D9, #90EE90, #FF7043',
      },
    },
    {
      name: 'darkBackground',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check if background is dark — makes text and button white instead of black.',
      },
    },

    // ── Floating product images ───────────────────────────────────────────────
    // Up to 3 images per card, each with independent position/rotation/scale.
    // This matches the reference where 2 floating packs appear on a single card.
    {
      name: 'images',
      type: 'array',
      maxRows: 3,
      admin: {
        description:
          '1–3 product images floating on the card. Position them independently for a "scattered" look like the reference.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        // Percentage offsets from card edges — gives pixel-perfect control in the component
        {
          name: 'top',
          type: 'text',
          defaultValue: '-5%',
          admin: {
            description: 'CSS top value. E.g. "-5%", "10px", "20%". Negative values let image bleed out of card.',
          },
        },
        {
          name: 'right',
          type: 'text',
          defaultValue: '0%',
          admin: {
            description: 'CSS right value. E.g. "0%", "-10px".',
          },
        },
        {
          name: 'width',
          type: 'text',
          defaultValue: '55%',
          admin: {
            description: 'Width of this image relative to card. E.g. "55%", "300px".',
          },
        },
        {
          name: 'rotation',
          type: 'number',
          defaultValue: -12,
          admin: {
            description: 'Rotation in degrees (-45 to 45). Negative = tilts left, positive = tilts right.',
          },
        },
        {
          name: 'zIndex',
          type: 'number',
          defaultValue: 2,
          admin: {
            description: 'Stack order when images overlap. Higher = on top.',
          },
        },
      ],
    },

    // ── Ordering / visibility ────────────────────────────────────────────────
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: {
        description: 'Display order — lower numbers appear first in the scroll.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide without deleting.',
      },
    },
  ],
}

export default BuyCards