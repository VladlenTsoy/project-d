import {FileOutput} from "replicate"
import {v4 as uuid} from "uuid"
import fs from "fs/promises"

/**
 * Преобразовать ответ в файлы
 * @param output
 */
export const outputToFiles = async (output: FileOutput[]) => {
    const urls: string[] = []

    for (const [index, file] of output.entries()) {
        const id = uuid()

        try {
            if (!file || typeof file.url !== "function") {
                console.warn(`⚠️ Skipping output[${id}] — not a valid FileOutput`)
                continue
            }

            urls.push(file.toString())

            const blob = await file.blob()
            const buffer = Buffer.from(await blob.arrayBuffer())
            const filename = `output_${id}.png`

            await fs.writeFile(`images/${filename}`, buffer)
            console.log(`💾 Saved: ${filename}`)
        } catch (err) {
            console.error(`❌ Failed to save output[${index}]:`, err)
        }
    }

    return urls
}