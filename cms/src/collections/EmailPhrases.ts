import { CollectionConfig } from 'payload'

const EmailPhrases: CollectionConfig = {
  slug: 'email-phrases',
  admin: {
    useAsTitle: 'phrase',
    defaultColumns: ['phrase', 'order', 'updatedAt'],
    description: 'The rotating phrases in the email section headline. E.g. "we chop up a Picasso,"',
  },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    {
      name: 'phrase',
      type: 'text',
      required: true,
      admin: { description: 'The rotating phrase. Should end with a comma. E.g. "we chop up a Picasso,"' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Controls rotation order. Lower = appears earlier.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to pause this phrase from appearing.' },
    },
  ],
}

export default EmailPhrases