import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Products from './collections/Products'
import Pages from './collections/Pages'
import SiteSettings from './globals/SiteSettings'
import HomePage from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Media, Products, Pages],
  globals: [SiteSettings, HomePage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})