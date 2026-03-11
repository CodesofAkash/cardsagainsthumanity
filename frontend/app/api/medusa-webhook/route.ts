import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
const CMS_API_KEY = process.env.PAYLOAD_API_KEY || '' // Set in Payload admin → API Keys

/**
 * Medusa fires webhooks to this endpoint when products change.
 *
 * In Medusa admin: Settings → Webhooks → Add webhook
 * URL: https://your-frontend.vercel.app/api/medusa-webhook
 * Events: product.updated, product.created
 *
 * Locally for testing, use: ngrok http 3000
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    console.log('[Medusa→CMS] Webhook received:', type)

    if (type === 'product.updated' || type === 'product.created') {
      const medusaProduct = data

      // Find matching Payload product by medusaId
      const searchRes = await fetch(
        `${CMS_URL}/api/products?where[medusaId][equals]=${medusaProduct.id}&limit=1`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(CMS_API_KEY ? { Authorization: `users API-Key ${CMS_API_KEY}` } : {}),
          },
        },
      )
      const searchData = await searchRes.json()
      const existing = searchData?.docs?.[0]

      if (existing) {
        // Update existing Payload product
        const updateRes = await fetch(
          `${CMS_URL}/api/products/${existing.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(CMS_API_KEY ? { Authorization: `users API-Key ${CMS_API_KEY}` } : {}),
            },
            body: JSON.stringify({
              title: medusaProduct.title,
              description: medusaProduct.description || existing.description,
              price: medusaProduct.variants?.[0]?.prices?.[0]?.amount ?? existing.price,
              variantId: medusaProduct.variants?.[0]?.id ?? existing.variantId,
            }),
          },
        )
        const updated = await updateRes.json()
        console.log('[Medusa→CMS] Updated product in Payload:', updated?.doc?.id)
        return NextResponse.json({ ok: true, action: 'updated', id: updated?.doc?.id })
      } else if (type === 'product.created') {
        // Create new product in Payload
        const slug = medusaProduct.handle || medusaProduct.title.toLowerCase().replace(/\s+/g, '-')
        const createRes = await fetch(`${CMS_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(CMS_API_KEY ? { Authorization: `users API-Key ${CMS_API_KEY}` } : {}),
          },
          body: JSON.stringify({
            title: medusaProduct.title,
            slug,
            description: medusaProduct.description || '',
            price: medusaProduct.variants?.[0]?.prices?.[0]?.amount ?? 0,
            medusaId: medusaProduct.id,
            variantId: medusaProduct.variants?.[0]?.id ?? '',
          }),
        })
        const created = await createRes.json()
        console.log('[Medusa→CMS] Created product in Payload:', created?.doc?.id)
        return NextResponse.json({ ok: true, action: 'created', id: created?.doc?.id })
      }
    }

    return NextResponse.json({ ok: true, action: 'ignored' })
  } catch (err) {
    console.error('[Medusa→CMS] Webhook error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// Allow Medusa to verify the endpoint is alive
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Medusa webhook endpoint active' })
}