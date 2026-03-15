const syncToPayload = async ({ event, container }: any) => {
  const query = container.resolve('query')

  const { data } = await query.graph({
    entity: 'product',
    filters: { id: event.data.id },
    fields: ['id', 'title', 'description'],
  })

  const product = data?.[0]
  if (!product) return

  const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001'
  const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || ''

  try {
    const searchRes = await fetch(
      `${PAYLOAD_URL}/api/products?where[medusaId][equals]=${product.id}`,
      { headers: { Authorization: `users API-Key ${PAYLOAD_SECRET}` } }
    )
    const searchData = await searchRes.json()
    const payloadProduct = searchData?.docs?.[0]
    if (!payloadProduct) return

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

    console.log('[Medusa->CMS] Synced product ' + product.id)
  } catch (err) {
    console.error('[Medusa->CMS] Sync error:', err)
  }
}

export default syncToPayload

export const config = {
  event: ['product.updated'],
}