import {Router} from "express"
import {v4 as uuid} from "uuid"
import {Briefs} from "../storage"
import {generateImagePrompts, generateMonthlyPlan} from "../services/plan.service"
import multer from "multer"
import path from "path"
import {uploadToS3} from "../services/aws.service"
import {generateSeedream} from "../services/replicate.service"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/") // куда сохраняем
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя с оригинальным расширением
        const ext = path.extname(file.originalname) // например .jpg
        const base = path.basename(file.originalname, ext)
        const uniqueName = `${base}-${Date.now()}${ext}`
        cb(null, uniqueName)
    }
})

const upload = multer({storage})

const router = Router()

/** Заполнение бриф */
router.post("/", (req, res) => {
    const id = uuid()
    const brief = {
        id,
        clientName: req.body.clientName || `client-${id}`,
        data: req.body.data || req.body,
        createdAt: new Date().toISOString()
    }
    Briefs[id] = brief
    res.status(201).json(brief)
})

/** Получить бриф */
router.get("/:id", (req, res) => {
    const b = Briefs[req.params.id]
    if (!b) return res.status(404).json({error: "not found"})
    res.json(b)
})

/** Заполнение бриф и запуск генерации */
router.post("/generate", upload.any(), async (req, res) => {
    const id = uuid()

    // 🧩 Попробуем распарсить JSON, если есть
    let parsedData: any = {}
    try {
        parsedData = JSON.parse(req.body.data || "{}")
    } catch {
        parsedData = req.body
    }

    // Массив путей к загруженным изображениям (если есть)
    const files = req.files as Express.Multer.File[]
    const localPaths = files.map((f) => f.path)
    const uploadUrls = await Promise.all(localPaths.map((p) => uploadToS3(p)))

    if (uploadUrls.length <= 0) {
        throw new Error("no image urls found.")
    }
    // const imageUrls = Array.isArray(result) ? result : [result]
    //
    // const uploaded = []
    // for (const url of imageUrls) {
    //     const s3Url = await uploadToS3(url, "updates")
    //     uploaded.push(s3Url)
    // }

    // 6️⃣ Собираем brief
    const brief = {
        id,
        clientName: parsedData.clientName || `client-${id}`,
        data: {
            ...parsedData
        },
        createdAt: new Date().toISOString()
    }

    Briefs[id] = brief

    // Генерация контент плана
    const plan = await generateMonthlyPlan(brief)
    // Генерация картинок
    const prompts = await generateImagePrompts(plan, parsedData.brand.category[0], parsedData.brand.category[1])
    //
    const images = await Promise.all(
        prompts.map(async (prompt) => {
            try {
                const url = await generateSeedream(prompt, uploadUrls, id)
                console.log(url)
                return url
            } catch (error) {
                console.error(error)
                return null
            }
        })
    )

    res.json({plan, images})
})

export default router
