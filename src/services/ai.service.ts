import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

/**
 *
 * @param system - Системный промт
 * @param user - Клиентский промт
 * @param maxTokens - Максимально кол-во используемых токенов
 * @param temp - Параметр случайности/креативности
 */
export async function aiChat(system: string, user: string, maxTokens = 1000, temp = 0.7) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set")

    const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {role: "system", content: system},
            {role: "user", content: user}
        ],
        max_tokens: maxTokens,
        temperature: temp
    })

    return res.choices[0]?.message?.content ?? ""
}

export async function generatePromptFromImage(
    {
        imagePath,
        brandName,
        brandStyle,
        targetAudience
    }: {
        imagePath: string
        brandName: string
        brandStyle: string
        targetAudience: string
    }) {
    const systemPrompt = `
Ты — профессиональный fashion art-директор.
Твоя задача — по изображению определить, что на нём за продукт, 
и создать 3 детализированных промпта для генерации изображений этого продукта 
в стиле бренда "${brandName}" (${brandStyle}).
Промпты должны быть в стиле фэшн-фотографии (editorial/luxury/street/lifestyle), 
максимально реалистичными, с описанием света, текстур и атмосферы.

Формат ответа (JSON):
{
  "productType": "...",
  "prompts": ["...", "...", "..."]
}
`
    const response = await client.chat.completions.create({
        model: "gpt-5-vision-preview",
        temperature: 0.9,
        messages: [
            {role: "system", content: systemPrompt},
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Проанализируй изображение и создай промпты. Целевая аудитория: ${targetAudience}.`
                    },
                    {
                        type: "image_url",
                        image_url: `data:image/jpeg;base64,${fs.readFileSync(imagePath).toString("base64")}`
                    }
                ]
            }
        ]
    })

    const result = response.choices[0].message.content
    try {
        return JSON.parse(result)
    } catch {
        return {raw: result}
    }
}