import dotenv from "dotenv"
import Replicate from "replicate"
import fsp from "fs/promises"
import {v4 as uuid} from "uuid"

dotenv.config()

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
    useFileOutput: true
})

/**
 * Генерация через stability с оптимизированными параметрами
 * @param prompt
 * @param imagePaths
 * @param seed
 */
export async function generateSeedream(prompt: string, imagePaths: string[], seed?: string): Promise<string> {
    console.log(prompt)
    const input = {
        size: "4K",
        width: 4024,
        height: 4024,
        prompt: prompt,
        max_images: 1,
        image_input: imagePaths,
        aspect_ratio: "3:4",
        seed: 1234,
        num_inference_steps: 50,
        guidance_scale: 8,
        sequential_image_generation: "disabled",
        negative_prompt: "blurry text, distorted text, unreadable label, out of focus letters, bad typography, misspelled text, artifact, low quality"
    }

    const output = await replicate.run("bytedance/seedream-4", {input})

    // Иногда Replicate возвращает массив строк (URL), иногда объекты
    if (!output) {
        throw new Error("Replicate did not return any output files.")
    }

    // Если это массив URL
    if (Array.isArray(output)) {
        // Может быть массив строк или объектов
        return output[0].url()
    }

    // Если это один объект (редкий случай)
    if (typeof output === "object" && "url" in output) {
        // @ts-ignore
        return output.url()
    }

    throw new Error("Unexpected Replicate output format: " + JSON.stringify(output))
}

/**
 * Генерация через NanoBanana
 * @param prompt
 * @param images
 */
export async function generateNanoBanana(prompt: string, images?: string): Promise<string[]> {
    const input = {
        prompt,
        image_input: images,
        output_format: "jpg"
    }

    try {
        const output = await replicate.run("google/nano-banana", {input})

        if (output instanceof ReadableStream) {
            const id = uuid()
            const filename = `images/output_${id}.jpg`

            // читаем поток в buffer
            const reader = output.getReader()
            const chunks: Uint8Array[] = []
            while (true) {
                const {done, value} = await reader.read()
                if (done) break
                if (value) chunks.push(value)
            }

            const buffer = Buffer.concat(chunks)
            await fsp.writeFile(filename, buffer)
            console.log(`💾 Saved: ${filename}`)

            return [filename]
        }

        throw new Error("⚠️ Replicate returned unsupported output type.")
    } catch (err) {
        console.error("🚨 Replicate error:", err)
        throw err
    }
}
