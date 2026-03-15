"use strict";
// medusa/src/subscribers/sync-to-payload.js
Object.defineProperty(exports, "__esModule", { value: true });
async function syncToPayload({ event, container }) {
    const query = container.resolve('query');
    const result = await query.graph({
        entity: 'product',
        filters: { id: event.data.id },
        fields: ['id', 'title', 'description'],
    });
    const product = result.data && result.data[0];
    if (!product)
        return;
    const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';
    const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || '';
    try {
        const searchRes = await fetch(PAYLOAD_URL + '/api/products?where[medusaId][equals]=' + product.id, { headers: { Authorization: 'users API-Key ' + PAYLOAD_SECRET } });
        const searchData = await searchRes.json();
        const payloadProduct = searchData.docs && searchData.docs[0];
        if (!payloadProduct)
            return;
        await fetch(PAYLOAD_URL + '/api/products/' + payloadProduct.id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'users API-Key ' + PAYLOAD_SECRET,
            },
            body: JSON.stringify({
                title: product.title,
                description: product.description,
            }),
        });
        console.log('[Medusa->CMS] Synced product ' + product.id);
    }
    catch (err) {
        console.error('[Medusa->CMS] Sync error:', err);
    }
}
syncToPayload.config = {
    event: ['product.updated'],
};
module.exports = syncToPayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy10by1wYXlsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL3N5bmMtdG8tcGF5bG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNENBQTRDOztBQUU1QyxLQUFLLFVBQVUsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtJQUMvQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXhDLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMvQixNQUFNLEVBQUUsU0FBUztRQUNqQixPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDOUIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUM7S0FDdkMsQ0FBQyxDQUFBO0lBRUYsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTTtJQUVwQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSx1QkFBdUIsQ0FBQTtJQUN0RSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUE7SUFFdkQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQzNCLFdBQVcsR0FBRyx3Q0FBd0MsR0FBRyxPQUFPLENBQUMsRUFBRSxFQUNuRSxFQUFFLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsR0FBRyxjQUFjLEVBQUUsRUFBRSxDQUNsRSxDQUFBO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDekMsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVELElBQUksQ0FBQyxjQUFjO1lBQUUsT0FBTTtRQUUzQixNQUFNLEtBQUssQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLEVBQUUsRUFBRTtZQUM5RCxNQUFNLEVBQUUsT0FBTztZQUNmLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxhQUFhLEVBQUUsZ0JBQWdCLEdBQUcsY0FBYzthQUNqRDtZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3BCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVzthQUNqQyxDQUFDO1NBQ0gsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDM0QsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELENBQUM7QUFDSCxDQUFDO0FBRUQsYUFBYSxDQUFDLE1BQU0sR0FBRztJQUNyQixLQUFLLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztDQUMzQixDQUFBO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUEifQ==