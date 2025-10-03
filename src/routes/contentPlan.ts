import {Router} from "express"
import {Briefs, ContentPlans} from "../storage"
import {generateImagePrompts, generateMonthlyPlan} from "../services/plan.service"

const router = Router()

/**
 * Generate a plan:
 * POST /content-plans/:clientId/generate
 */
router.post("/:clientId/generate", async (req, res) => {
    try {
        const clientId = req.params.clientId
        const brief = Briefs[clientId]
        if (!brief) return res.status(404).json({error: "brief not found"})

        const plan = await generateMonthlyPlan(brief)
        const images = await generateImagePrompts(plan)

        res.json(plan);
    } catch (err: any) {
        console.error(err)
        res.status(500).json({error: err.message})
    }
})

/**
 * get plan:
 */
router.get("/:clientId", (req, res) => {
    const p = ContentPlans[req.params.clientId]
    if (!p) return res.status(404).json({error: "no plan found"})
    res.json(p)
})

export default router
