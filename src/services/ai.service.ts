import OpenAI from "openai"
import dotenv from "dotenv"

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
