import {Router} from "express"
import multer from "multer"
import {generateSeedream} from "../services/replicate.service"
import {uploadToS3} from "../services/aws.service"

const router = Router()

// Настройка хранилища (куда сохранять)
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function(_, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({storage})

// Генерация одного креатива по prompt
router.post("/generate", upload.array("image", 5), async (req, res) => {
    try {
        const {prompt} = req.body
        if (!prompt) {
            return res.status(400).json({error: "Prompt is required"})
        }

        // Массив путей к загруженным изображениям (если есть)
        const files = req.files as Express.Multer.File[]
        const imagePaths = files?.map((file) => file.path) || []
        const uploadUrls = await Promise.all(imagePaths.map(val => uploadToS3(val)))

        if (uploadUrls.length <= 0) {
            throw new Error("no image urls found.")
        }

        const result = await generateSeedream(prompt, uploadUrls)
        const imageUrls = Array.isArray(result) ? result : [result]

        const uploaded = []
        for (const url of imageUrls) {
            const s3Url = await uploadToS3(url, "updates")
            uploaded.push(s3Url)
        }

        res.json({uploaded})
    } catch (err) {
        console.error("Replicate error:", err)
        res.status(500).json({error: "Failed to generate image"})
    }
})

export default router
