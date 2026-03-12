import { CollectionConfig } from 'payload'

const BuyCards: CollectionConfig = {
  slug: 'buy-cards',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'cta', 'order', 'updatedAt'],
    description: 'The product cards in the "Buy the game." scroll section. Control colors, labels, and which product they link to.',
  },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Big headline on the card. Use \\n for a line break. E.g. "America\'s #1\\ngerbil coffin."' },
    },
    {
      name: 'cta',
      type: 'text',
      required: true,
      admin: { description: 'Button text. E.g. "Buy Now"' },
    },
    {
      name: 'href',
      type: 'text',
      defaultValue: '#',
      admin: { description: 'Link when clicking the card or button. E.g. /products/more-cah' },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      required: true,
      defaultValue: '#87CEEB',
      admin: { description: 'Card background color as hex. E.g. #87CEEB, #FFE135, #FFB3D9, #90EE90, #111111' },
    },
    {
      name: 'darkBackground',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Check this for dark/black backgrounds — makes the label text and button white instead of black.' },
    },
    {
      name: 'productImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Product image shown in the top-right of the card. Upload your product shot here.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Lower numbers appear first (leftmost in the scroll).' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide this card without deleting it.' },
    },
  ],
}

export default BuyCards