import { ExecArgs } from "@medusajs/framework/types"

export default async function getProducts({ container }: ExecArgs) {
  const query = container.resolve("query")
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.id", "variants.title"],
  })
  console.log("Products:", JSON.stringify(data, null, 2))
}