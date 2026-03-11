import { GlobalConfig } from 'payload'

const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: { read: () => true },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Cards Against Humanity' },
        { name: 'quote', type: 'text', defaultValue: '"Hysterical."' },
        { name: 'quoteSource', type: 'text', defaultValue: 'TIME' },
        {
          name: 'cards',
          type: 'array',
          fields: [
            { name: 'text', type: 'text', required: true },
            { name: 'black', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      name: 'about',
      type: 'group',
      fields: [
        {
          name: 'paragraph1',
          type: 'textarea',
          defaultValue:
            'Cards Against Humanity is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! Wow.',
        },
        {
          name: 'paragraph2',
          type: 'textarea',
          defaultValue:
            'The game is simple. Each round, one player asks a question from a black card, and everyone else answers with their funniest white card.',
        },
      ],
    },
    {
      name: 'buySection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Buy the game.' },
      ],
    },
    {
      name: 'stealSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Steal the game.' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Since day one, Cards Against Humanity has been available as a free download on our website.',
        },
        { name: 'badgeText', type: 'text', defaultValue: 'Free!\nDownload\nnow!' },
      ],
    },
    {
      name: 'emailSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'To find out first when we chop up a Picasso, give us your email:',
        },
        {
          name: 'disclaimer',
          type: 'text',
          defaultValue: "We'll only email you like twice a year.",
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'copyright',
          type: 'text',
          defaultValue: '©2026 Cards Against Humanity LLC',
        },
      ],
    },
  ],
}

export default HomePage