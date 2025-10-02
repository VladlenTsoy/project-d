import {BrandData} from "../types"

export const parseTextFromAi = (raw: string): BrandData => {
    let json = raw.trim().replace(/^```json\s*|```$/g, "").replace(/^```/, "").replace(/```$/, "").trim()

    let parsed: BrandData[] = []
    try {
        parsed = JSON.parse(json)
    } catch (e) {
        // fallback: try to extract first JSON substring
        const start = json.indexOf("[")
        const end = json.lastIndexOf("]")
        if (start >= 0 && end >= 0) {
            const sub = json.substring(start, end + 1)
            try {
                parsed = JSON.parse(sub)
            } catch (err) {
                parsed = []
            }
        }
    }

    return parsed as unknown as BrandData
}