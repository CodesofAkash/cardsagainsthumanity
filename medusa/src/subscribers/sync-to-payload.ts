import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'

export default async function syncToPayload({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve('query')
  
  const { data: [product] } = await query.graph({
    entity: 'product',
    filters: { id: event.data.id },
    fields: ['id', 'title', 'description'],
  })

  if (!product) return

  const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001'
  const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET

  try {
    const searchRes = await fetch(
      `${PAYLOAD_URL}/api/products?where[medusaId][equals]=${product.id}`,
      {
        headers: { Authorization: `users API-Key ${PAYLOAD_SECRET}` },
      }
    )
    const searchData = await searchRes.json()
    const payloadProduct = searchData?.docs?.[0]

    if (!payloadProduct) {
      console.log('[Medusa→CMS] Product not found in Payload, skipping')
      return
    }

    // Update Payload product
    await fetch(`${PAYLOAD_URL}/api/products/${payloadProduct.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `users API-Key ${PAYLOAD_SECRET}`,
      },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
      }),
    })

    console.log(`[Medusa→CMS] Synced product ${product.id} to Payload`)
  } catch (err) {
    console.error('[Medusa→CMS] Sync error:', err)
  }
}

export const config: SubscriberConfig = {
  event: ['product.updated'],
}