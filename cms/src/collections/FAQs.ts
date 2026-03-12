import { CollectionConfig } from 'payload'

const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order', 'updatedAt'],
    description: 'FAQ items shown on the homepage. Add, remove, or reorder freely.',
  },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      admin: { description: 'The question text shown in the accordion header.' },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: { description: 'The answer. Supports bold, italic, and links (underlined automatically).' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Lower numbers appear first. Use 10, 20, 30... to leave room.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide this FAQ without deleting it.' },
    },
  ],
}

export default FAQs