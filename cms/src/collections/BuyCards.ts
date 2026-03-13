import { CollectionConfig } from 'payload'

const BuyCards: CollectionConfig = {
  slug: 'buy-cards',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'tag', 'order', 'updatedAt'],
    description:
      'Cards shown in the "Buy the game" section. Controls text, images, colors and links.',
  },

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description:
          'Main headline on the card. Use \\n for line breaks. Example: "Mooooore\\ncards!"',
      },
    },

    {
      name: 'tag',
      type: 'text',
      admin: {
        description:
          'Optional small tag like "Expansion", "New", "Limited", etc.',
      },
    },

    {
      name: 'cta',
      type: 'text',
      required: true,
      defaultValue: 'Buy Now',
      admin: {
        description: 'Button text.',
      },
    },

    {
      name: 'href',
      type: 'text',
      defaultValue: '#',
      admin: {
        description: 'Where the card links to. Example: /products/hot-box',
      },
    },

    {
      name: 'backgroundColor',
      type: 'text',
      required: true,
      defaultValue: '#FFB3D9',
      admin: {
        description: 'Card background color (hex).',
      },
    },

    {
      name: 'darkBackground',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Enable if the background is dark so text + button become white.',
      },
    },

    {
      name: 'images',
      type: 'array',
      maxRows: 2,
      admin: {
        description:
          'One or two product images floating on the card.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'position',
          type: 'select',
          options: [
            { label: 'Top Left', value: 'top-left' },
            { label: 'Top Right', value: 'top-right' },
            { label: 'Bottom Left', value: 'bottom-left' },
            { label: 'Bottom Right', value: 'bottom-right' },
          ],
          defaultValue: 'top-right',
        },
        {
          name: 'rotation',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Rotate image slightly for style (-20 to 20)',
          },
        },
      ],
    },

    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: {
        description:
          'Lower numbers appear first in the horizontal scroll.',
      },
    },

    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Uncheck to hide this card without deleting it.',
      },
    },
  ],
}

export default BuyCards