import {Router} from "express"
import {Briefs, StylePresets, ContentPlans} from "../storage"
import {generateMonthlyPlan} from "../services/plan.service"
import {generateImagePrompt} from "../prompts/image-prompt"

const router = Router()

/**
 * Generate a plan:
 * POST /content-plans/:clientId/generate
 * body: { month: "2025-10", postsPerWeek: 3, presetId (optional) }
 */
router.post("/:clientId/generate", async (req, res) => {
    try {
        const clientId = req.params.clientId
        const brief = Briefs[clientId]
        if (!brief) return res.status(404).json({error: "brief not found"})

        const plan = await generateMonthlyPlan(brief)

        res.json(plan);


        // const month = req.body.month || (new Date()).toISOString().slice(0, 7);
        // const postsPerWeek = Number(req.body.postsPerWeek) || 3;
        // const presetId = req.body.presetId || Object.keys(StylePresets).find(k => StylePresets[k].clientId === clientId);
        // if (!presetId) return res.status(400).json({error: "no style preset found for client. run style dialog first"});
        //
        // const preset = StylePresets[presetId];
        // // generate plan with GPT
        // const plan = await generateMonthlyPlan(brief, preset, month, postsPerWeek);
        //
        // // generate images for each item (sequential for prototype; can parallelize)
        // for (const item of plan.items) {
        //     try {
        //         const imageUrl = await generateImageAndSave(item.prompt_en);
        //         item.image_url = imageUrl;
        //     } catch (err) {
        //         console.warn("image generation failed for item", item.id, err);
        //         item.image_url = undefined;
        //     }
        // }
        //
        // // save plan (already saved in generateMonthlyPlan but we reassign)
        // ContentPlans[clientId] = plan;
        // res.json(plan);
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
