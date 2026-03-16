import { CollectionConfig } from 'payload'

function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const normalizedBase = baseUrl.replace(/\/$/, '')
  return `${normalizedBase}${url.startsWith('/') ? '' : '/'}${url}`
}

async function resolveMainImageUrl(doc: any, payload: any, cmsPublicUrl: string): Promise<string> {
  const mainImage = doc?.mainImage

  if (!mainImage) return ''

  if (typeof mainImage === 'object' && typeof mainImage.url === 'string' && mainImage.url) {
    return toAbsoluteUrl(mainImage.url, cmsPublicUrl)
  }

  if (typeof mainImage === 'string') {
    try {
      const media = await payload.findByID({ collection: 'media', id: mainImage })
      if (media?.url) return toAbsoluteUrl(media.url, cmsPublicUrl)
    } catch (error) {
      console.warn('[CMS→Medusa] Unable to resolve mainImage media URL:', error)
    }
  }

  return ''
}

const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'bullets',
      type: 'array',
      fields: [{ name: 'text', type: 'text' }],
    },
    {
      name: 'price',
      type: 'number',
      admin: { description: 'Price in cents (e.g. 2900 = $29.00)' },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Primary product image shown in product cards and product detail page.',
      },
    },
    {
      name: 'galleryImages',
      type: 'array',
      admin: {
        description: 'Additional product images used in the expandable gallery preview.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Legacy image list. Prefer using Main Image + Gallery Images for new content.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'medusaId',
      type: 'text',
      admin: { description: 'Medusa product ID. Get this from Medusa admin → Products → [product] → Variants.' },
    },
    {
      name: 'variantId',
      type: 'text',
      admin: { description: 'Medusa variant ID. Get this from Medusa admin → Products → [product] → Variants.' },
    },
  ],

  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000'
        const MEDUSA_ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN || ''
        const CMS_PUBLIC_URL =
          process.env.CMS_PUBLIC_URL ||
          process.env.PAYLOAD_PUBLIC_SERVER_URL ||
          'http://localhost:3001'

        if (!MEDUSA_ADMIN_TOKEN) {
          console.warn('[CMS→Medusa] MEDUSA_ADMIN_TOKEN not set, skipping sync')
          return doc
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEDUSA_ADMIN_TOKEN}`,
        }

        const { getPayload } = await import('payload')
        const payload = await getPayload({ config: (await import('../payload.config')).default })
        const thumbnail = await resolveMainImageUrl(doc, payload, CMS_PUBLIC_URL)

        try {
          if (operation === 'create') {
            // 1. Create product in Medusa
            const productRes = await fetch(`${MEDUSA_URL}/admin/products`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                title: doc.title,
                description: doc.description || '',
                ...(thumbnail ? { thumbnail } : {}),
                status: 'published',
                variants: [
                  {
                    title: 'Default',
                    inventory_quantity: 100,
                    prices: [
                      { currency_code: 'usd', amount: doc.price || 0 },
                    ],
                  },
                ],
              }),
            })
            const productData = await productRes.json()
            const medusaProductId = productData?.product?.id
            const medusaVariantId = productData?.product?.variants?.[0]?.id

            if (medusaProductId) {
              // 2. Write Medusa IDs back to Payload
              // Note: direct DB update to avoid infinite hook loop
              await payload.update({
                collection: 'products',
                id: doc.id,
                data: { medusaId: medusaProductId, variantId: medusaVariantId },
              })
              console.log(`[CMS→Medusa] Created product ${medusaProductId}`)
            }
          } else if (operation === 'update' && doc.medusaId) {
            // Update existing Medusa product
            await fetch(`${MEDUSA_URL}/admin/products/${doc.medusaId}`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                title: doc.title,
                description: doc.description || '',
                ...(thumbnail ? { thumbnail } : {}),
              }),
            })

            // Update variant price if variantId exists
            if (doc.variantId && doc.price) {
              await fetch(
                `${MEDUSA_URL}/admin/products/${doc.medusaId}/variants/${doc.variantId}`,
                {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    prices: [{ currency_code: 'usd', amount: doc.price }],
                  }),
                },
              )
            }
            console.log(`[CMS→Medusa] Updated product ${doc.medusaId}`)
          }
        } catch (err) {
          console.error('[CMS→Medusa] Sync error:', err)
        }

        return doc
      },
    ],
  },
}

export default Products