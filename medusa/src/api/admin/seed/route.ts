import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import seedDemoData from "../../../scripts/seed"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const secret = req.query.secret
  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  
  try {
    await seedDemoData({ container: req.scope })
    res.json({ success: true, message: "Seeded successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}