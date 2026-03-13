import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Products from './collections/Products'
import Pages from './collections/Pages'
import FAQs from './collections/FAQs'
import StuffPosts from './collections/StuffPosts'
import BuyCards from './collections/BuyCards'
import EmailPhrases from './collections/EmailPhrases'
import SiteSettings from './globals/SiteSettings'
import HomePage from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// All origins that are allowed to hit this CMS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_FRONTEND_URL,   // e.g. https://your-frontend.vercel.app
  process.env.NEXT_PUBLIC_CMS_URL,        // e.g. https://cardsagainsthumanity-cms.vercel.app
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[]

export default buildConfig({
  // ── CORS + CSRF ─────────────────────────────────────────────────────────────
  // Must include the CMS's own deployed URL so admin panel mutations work
  cors: allowedOrigins,
  csrf: allowedOrigins,

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [
    Users,
    Media,
    Products,
    Pages,
    FAQs,
    StuffPosts,
    BuyCards,
    EmailPhrases,
  ],
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

  plugins: [
    // ── Vercel Blob Storage ──────────────────────────────────────────────────
    // Replaces local filesystem storage — required on Vercel (read-only FS)
    // clientUploads: true bypasses the 4.5MB Vercel serverless body limit
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true,
    }),
  ],
})