import { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'type', type: 'select', options: ['text', 'products', 'faq', 'email-signup'] },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}

export default Pages