// src/routes/replicate.routes.ts
import {Router} from "express"
import {generateStability} from "../services/replicate.service"
// import {ReplicateService} from "../services/replicate.service"

const router = Router()
// const replicateService = new ReplicateService()

// Генерация одного креатива по prompt
router.post("/generate", async (req, res) => {
    try {
        const {prompt} = req.body
        if (!prompt) {
            return res.status(400).json({error: "Prompt is required"})
        }

        const imageUrl = await generateStability(prompt)
        res.json({imageUrl})
    } catch (err) {
        console.error("Replicate error:", err)
        res.status(500).json({error: "Failed to generate image"})
    }
})

export default router
