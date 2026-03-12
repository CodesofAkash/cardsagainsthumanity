import { CollectionConfig } from 'payload'

const StuffPosts: CollectionConfig = {
  slug: 'stuff-posts',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'tag', 'order', 'updatedAt'],
    description: 'Cards shown in the "Stuff we\'ve done" section. Add new ones anytime.',
  },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Title displayed on the card. E.g. "Black Friday 2018"' },
    },
    {
      name: 'tag',
      type: 'select',
      options: [
        { label: 'Read', value: 'Read' },
        { label: 'Watch', value: 'Watch' },
        { label: 'Listen', value: 'Listen' },
        { label: 'Play', value: 'Play' },
      ],
      defaultValue: 'Read',
      admin: { description: 'Small tag shown above the title.' },
    },
    {
      name: 'description',
      type: 'text',
      admin: { description: 'Short description shown below the title.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Square image (1080×1080 recommended).' },
    },
    {
      name: 'href',
      type: 'text',
      defaultValue: '#',
      admin: { description: 'Link URL when the card is clicked.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Lower numbers appear first.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide without deleting.' },
    },
  ],
}

export default StuffPosts