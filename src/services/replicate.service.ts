import dotenv from "dotenv"
import Replicate, {FileOutput} from "replicate"
import fs from "fs/promises"
import {v4 as uuid} from "uuid"
import {outputToFiles} from "../utils/outputToFiles"

dotenv.config()

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
    useFileOutput: true
})

/**
 * Генерация через stability с оптимизированными параметрами
 * @param prompt
 */
export async function generateStability(prompt: string): Promise<string[] | string> {
    const input = {
        size: "2K",
        width: 2048,
        height: 2048,
        prompt: prompt,
        max_images: 1,
        image_input: [],
        aspect_ratio: "4:3",
        sequential_image_generation: "disabled",
        negative_prompt: "blurry, cartoon, illustration, painting, cgi, fake, distorted, watermark, text, bad anatomy",
    }

    const output = (await replicate.run(
        "bytedance/seedream-4",
        {input}
    )) as string[]

    if (!output || output.length === 0) {
        throw new Error("Replicate did not return any output files.")
    }

    // @ts-ignore
    return output[0].url()
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
            await fs.writeFile(filename, buffer)
            console.log(`💾 Saved: ${filename}`)

            return [filename]
        }

        throw new Error("⚠️ Replicate returned unsupported output type.")
    } catch (err) {
        console.error("🚨 Replicate error:", err)
        throw err
    }
}
