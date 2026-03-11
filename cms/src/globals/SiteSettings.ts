import { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'siteTitle', type: 'text', defaultValue: 'Cards Against Humanity' },
    { name: 'footerText', type: 'text', defaultValue: '©2026 Cards Against Humanity LLC' },
    {
      name: 'footerLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'navLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

export default SiteSettings