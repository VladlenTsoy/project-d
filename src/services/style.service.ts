import {v4 as uuid} from "uuid"
import {StyleSession, StylePreset, Brief} from "../types"
import {StyleSessions, StylePresets} from "../storage"
import dayjs from "dayjs"
import {aiChat} from "./ai.service"


const questions = [
    "",
]

/**
 * Формируем очередь вопросов на основе брифа.
 * Для MVP — фиксированный набор вопросов, но адаптированный по нише (если есть поле productType в брифе).
 */
export function startStyleSession(clientId: string, brief: Brief): StyleSession {
    const productType = brief.data?.productType || ""
    const questions = [
        "Какие изображения вы хотите создавать чаще всего? (предмет, портрет, лайфстайл, коллаж и т.д.)",
        "Какой художественный формат вам ближе? (фото, 3D, иллюстрация, живопись и т.д.)",
        "Какое настроение/атмосфера должны быть у картинок?",
        "Какое освещение вы предпочитаете? (мягкое, контровое, золотой час и т.д.)",
        "Цветовая палитра — три основных цвета или сочетания?"
    ]
    const session: StyleSession = {
        id: uuid(),
        clientId,
        stepIndex: 0,
        answers: {},
        questions,
        createdAt: dayjs().toISOString(),
        finished: false,
        preset: null
    }
    StyleSessions[session.id] = session
    return session
}

export function answerStyleQuestion(sessionId: string, answer: string) {
    const session = StyleSessions[sessionId]
    if (!session) throw new Error("Session not found")
    const idx = session.stepIndex
    const q = session.questions[idx]
    session.answers[`q${idx}`] = {question: q, answer}
    session.stepIndex += 1
    if (session.stepIndex >= session.questions.length) session.finished = true
    return session
}

/**
 * Создаём финальный стиль-пресет на основе всех ответов (MVP: краткое объединение)
 */
export async function buildPresetFromSession(sessionId: string): Promise<StylePreset> {
    const session = StyleSessions[sessionId]
    if (!session) throw new Error("Session not found")
    if (!session.finished) throw new Error("Session not finished")

    const id = sessionId + "-preset"

    // Собираем ответы клиента в текст
    const answers = Object.values(session.answers)
        .map((a: any) => `Q: ${a.question}\nA: ${a.answer}`)
        .join("\n")

    // Отправляем в AI
    const system = "Ты — эксперт по генерации промтов для Stable Diffusion и MidJourney. " +
        "На основе ответов клиента ты создаёшь финальный стиль-пресет: базовый промт-шаблон и 3 примера."
    const user = `Вот ответы клиента:\n${answers}\n\nСгенерируй:\n1. Краткое описание стиля\n2. Базовый промт-шаблон с плейсхолдером {idea}\n3. Три примера промтов на основе шаблона.`

    const aiResponse = await aiChat(system, user, 800, 0.8)

    // Разбор ответа (MVP — просто сохраняем как текст)
    const preset: StylePreset = {
        id,
        clientId: session.clientId,
        description: aiResponse, // в MVP можно хранить всё тут
        basePromptTemplate: "{idea}", // плейсхолдер
        examples: [],
        createdAt: new Date().toISOString()
    }

    console.log(preset)
    StylePresets[id] = preset
    session.preset = preset
    return preset
}
//
//
// export function buildPresetFromSession1(sessionId: string) {
//     const session = StyleSessions[sessionId];
//     if (!session) throw new Error("Session not found");
//     if (!session.finished) throw new Error("Session not finished");
//
//     const id = sessionId + "-preset";
//     const description = Object.values(session.answers).map((a: any) => a.answer).slice(0, 4).join("; ");
//     const basePromptTemplate = "{idea}, " + Object.values(session.answers).map((a: any) => a.answer).slice(0, 5).join(", ") + " --ar 4:5 --v 6";
//     const examples = [
//         `${basePromptTemplate.replace("{idea}", "Product hero shot, minimalistic flatlay")}`,
//         `${basePromptTemplate.replace("{idea}", "Lifestyle shot, person using product")}`,
//         `${basePromptTemplate.replace("{idea}", "Close-up of texture and material")}`
//     ];
//     const preset: StylePreset = {
//         id,
//         clientId: session.clientId,
//         description,
//         basePromptTemplate,
//         examples,
//         createdAt: new Date().toISOString()
//     };
//     StylePresets[id] = preset;
//     session.preset = preset;
//     return preset;
// }