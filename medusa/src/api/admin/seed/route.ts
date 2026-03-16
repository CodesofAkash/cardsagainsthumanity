import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import seedDemoData from "../../../scripts/seed"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const secret = req.query.secret
  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  
  try {
    await seedDemoData({ container: req.scope, args: [] })
    res.json({ success: true, message: "Seeded successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}