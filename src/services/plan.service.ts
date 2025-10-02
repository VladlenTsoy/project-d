import {Brief} from "../types"
import {generatePlanSystemPrompt} from "../prompts/plan-system-prompt"
import {generatePlanUserPrompt} from "../prompts/plan-user-prompt"
import {parseTextFromAi} from "../utils/parsedTextFromAi"
import {generateImagePrompt} from "../prompts/image-prompt"

/**
 * Основная функция: 1) просим GPT составить темы для дат; 2) для каждой темы генерим caption+hashtags+prompt.
 */
// export async function generateMonthlyPlan(brief: Brief, preset: StylePreset, month: string, postsPerWeek = 3) {
export async function generateMonthlyPlan(brief: Brief): Promise<string[]> {
    // 1) allocate dates
    // const dates = allocateDatesForMonth(month, postsPerWeek)

    // 2) ask GPT to create topics for each date
    const sys = generatePlanSystemPrompt()
    const user = generatePlanUserPrompt({brief: brief})
    // const raw = await aiChat(sys, user, 1200, 0.8)

    // try parse JSON inside raw
    const raw = "```json { \"brandStrategy\": { \"strategyTitle\": \"Kokoro Apparel: Bridging Anime and Everyday Fashion\", \"coreInsight\": \"Gen Z values both nostalgia and uniqueness, yearning for brands that resonate emotionally and culturally with their interests.\", \"bigIdea\": \"Kokoro Apparel merges the vibrant world of anime with modern minimalistic streetwear, creating a unique identity that appeals to the heart of youth culture.\", \"strategicObjectives\": [ \"Increase brand visibility among Gen Z and young professionals.\", \"Drive online sales through exclusive limited-edition drops.\", \"Build a community around shared interests in anime and streetwear.\" ], \"targetAudience\": { \"demographics\": { \"age\": \"18-30\", \"gender\": \"All\", \"location\": \"Urban areas worldwide\" }, \"psychographics\": { \"interests\": [\"Anime\", \"Streetwear\", \"Fashion\", \"Pop Culture\"], \"values\": [\"Creativity\", \"Individuality\", \"Nostalgia\"] }, \"mediaHabits\": { \"platforms\": [\"Instagram\", \"TikTok\", \"YouTube\"], \"contentTypes\": [\"Reels\", \"Memes\", \"Fashion Lookbooks\"] } }, \"brandPersonality\": \"Bold, youthful, and culturally attuned, with a playful edge that invites participation.\", \"contentPillars\": [ \"Anime Culture: Showcase anime inspirations in apparel.\", \"Streetwear Lifestyle: Highlight styling tips and trends.\", \"Community Engagement: Foster conversations around anime and streetwear.\", \"Limited Editions: Create urgency with exclusive drops.\" ], \"visualVibe\": { \"mood\": \"Futuristic, energetic, and vibrant with a hint of nostalgia.\", \"colorPalette\": [\"#FF6F61\", \"#6DB3F2\", \"#F0E2E5\", \"#2E3A4D\", \"#FFD700\"], \"typography\": \"Bold sans-serif fonts combined with playful script elements for bilingual messaging.\", \"photographyStyle\": \"High-contrast images with glitch aesthetics, featuring street settings and models styled in limited editions.\" }, \"platformStrategy\": \"Leverage Instagram's visual nature to showcase products and engage users. Focus on storytelling through Reels and community interaction via Stories.\", \"measurementKPIs\": { \"followersGrowth\": \"10,000 new Instagram followers in 3 months\", \"salesIncrease\": \"20% increase in online sales in 3 months\" } }, \"contentPlan\": { \"monthlyStrategy\": \"The content plan for Kokoro Apparel focuses on building brand awareness and community engagement while driving online sales. Each week will highlight different aspects of the brand, from launching limited editions to showcasing anime influences. The posts will be a mix of storytelling, engagement, and conversion-focused content to keep the audience excited and involved with the brand.\", \"calendar\": [ { \"date\": \"2023-11-01\", \"type\": \"post\", \"goal\": \"Awareness\", \"idea\": \"Introduce Kokoro Apparel with a visually striking post blending anime and streetwear.\", \"scenario\": \"High-contrast image of a model wearing a limited-edition outfit in an urban setting with anime-inspired design elements.\", \"text\": \"Welcome to Kokoro Apparel! Where anime passion meets everyday fashion. 🌟 #KokoroApparel\", \"hashtags\": [\"#AnimeFashion\", \"#Streetwear\", \"#KokoroApparel\", \"#AnimeCulture\", \"#FashionInspo\", \"#UrbanStyle\"] }, { \"date\": \"2023-11-05\", \"type\": \"story\", \"goal\": \"Engagement\", \"idea\": \"Poll about favorite anime genres to engage the audience.\", \"scenario\": \"Use a fun poll format asking followers to choose between 'Shonen' and 'Shojo' anime, followed by a sneak peek of the upcoming collection.\", \"text\": \"What's your favorite anime genre? Vote now! 🎌 #KokoroPoll\", \"hashtags\": [\"#AnimePoll\", \"#KokoroApparel\", \"#Anime\"] }, { \"date\": \"2023-11-10\", \"type\": \"reel\", \"goal\": \"Conversion\", \"idea\": \"Show a behind-the-scenes look at the design process of the limited edition collection.\", \"scenario\": \"A fast-paced reel showing sketches, fabric selection, and final product shots, ending with a call to action to check the website.\", \"text\": \"See how your favorite Kokoro designs come to life! Limited edition drops coming soon. 🌟 #StayTuned\", \"hashtags\": [\"#BehindTheScenes\", \"#KokoroApparel\", \"#FashionDesign\", \"#AnimeStreetwear\"] } ] } } ```"
    const dataJson = parseTextFromAi(raw)

    const prompts = dataJson.contentPlan.calendar.map((item) => {
        const imagePrompt = generateImagePrompt({
            brandStrategy: dataJson.brandStrategy,
            item,
            category: "clothes",
            subcategory: "outerwear"
        })
        console.log(imagePrompt)
        return imagePrompt
    })


    return dataJson

    // For each parsed item, generate caption+hashtags+prompt
    // const items: ContentItem[] = [];
    // for (const p of parsed) {
    //     const idea = (p.idea || p.topic || "Styled visual idea").toString();
    //     // ask GPT for caption and hashtags
    //     const sys2 = `Ты SMM-копирайтер. Для идеи: "${idea}" придумай caption (40-120 слов) и 6-10 релевантных хештегов. Верни JSON {"caption":"...","hashtags":["#..."]}`;
    //     const raw2 = await aiChat(sys2, `Бриф: ${JSON.stringify(brief.data)}.`, 400, 0.7);
    //     let json2 = raw2.trim().replace(/^```json\s*|```$/g, "").trim();
    //     let parsed2 = {caption: "", hashtags: [] as string[]};
    //     try {
    //         parsed2 = JSON.parse(json2);
    //     } catch (e) {
    //         // fallback simple split
    //         parsed2.caption = raw2.slice(0, 250);
    //         parsed2.hashtags = ["#brand"];
    //     }
    //
    //     // build prompt using preset.template
    //     const prompt_en = preset.basePromptTemplate.replace("{idea}", idea);
    //     const hashtags: string[] = Array.isArray(parsed2.hashtags)
    //         ? parsed2.hashtags
    //         : typeof parsed2.hashtags === "string"
    //             ? (parsed2.hashtags as "").split(",").map((h: string) => h.trim())
    //             : [];
    //
    //     items.push({
    //         id: uuid(),
    //         date: p.date,
    //         type: p.type || "post",
    //         topic: p.topic || idea,
    //         caption: parsed2.caption,
    //         hashtags,
    //         prompt_en,
    //         image_url: undefined
    //     });
    // }
    //
    // // assemble plan and save
    // const plan: ContentPlan = {
    //     id: uuid(),
    //     clientId: brief.id,
    //     month,
    //     items,
    //     createdAt: new Date().toISOString()
    // };
    // ContentPlans[plan.clientId] = plan;
    // return plan;
}
