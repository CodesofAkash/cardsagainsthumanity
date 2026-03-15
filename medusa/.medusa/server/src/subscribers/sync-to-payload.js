"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const syncToPayload = async ({ event, container }) => {
    const query = container.resolve('query');
    const { data } = await query.graph({
        entity: 'product',
        filters: { id: event.data.id },
        fields: ['id', 'title', 'description'],
    });
    const product = data?.[0];
    if (!product)
        return;
    const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';
    const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || '';
    try {
        const searchRes = await fetch(`${PAYLOAD_URL}/api/products?where[medusaId][equals]=${product.id}`, { headers: { Authorization: `users API-Key ${PAYLOAD_SECRET}` } });
        const searchData = await searchRes.json();
        const payloadProduct = searchData?.docs?.[0];
        if (!payloadProduct)
            return;
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
        });
        console.log('[Medusa->CMS] Synced product ' + product.id);
    }
    catch (err) {
        console.error('[Medusa->CMS] Sync error:', err);
    }
};
exports.default = syncToPayload;
exports.config = {
    event: ['product.updated'],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy10by1wYXlsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL3N5bmMtdG8tcGF5bG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFPLEVBQUUsRUFBRTtJQUN4RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXhDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQzlCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDO0tBQ3ZDLENBQUMsQ0FBQTtJQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTTtJQUVwQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSx1QkFBdUIsQ0FBQTtJQUN0RSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUE7SUFFdkQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQzNCLEdBQUcsV0FBVyx5Q0FBeUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUNuRSxFQUFFLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsY0FBYyxFQUFFLEVBQUUsRUFBRSxDQUNsRSxDQUFBO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDekMsTUFBTSxjQUFjLEdBQUcsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjO1lBQUUsT0FBTTtRQUUzQixNQUFNLEtBQUssQ0FBQyxHQUFHLFdBQVcsaUJBQWlCLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUM5RCxNQUFNLEVBQUUsT0FBTztZQUNmLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxhQUFhLEVBQUUsaUJBQWlCLGNBQWMsRUFBRTthQUNqRDtZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3BCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVzthQUNqQyxDQUFDO1NBQ0gsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDM0QsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELENBQUM7QUFDSCxDQUFDLENBQUE7QUFFRCxrQkFBZSxhQUFhLENBQUE7QUFFZixRQUFBLE1BQU0sR0FBRztJQUNwQixLQUFLLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztDQUMzQixDQUFBIn0=