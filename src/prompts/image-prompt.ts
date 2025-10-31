import {BrandData} from "../types"
import {promptTemplates} from "./prompt-templates"

interface BaseProps {
    brandStrategy: BrandData["brandStrategy"]
    item: BrandData["contentPlan"]["calendar"][0]
}

const generateBaseContentPrompt = ({brandStrategy, item}: BaseProps) => {
    // return `
    //   Brand personality: ${brandStrategy.brandPersonality}.
    //   Mood: ${brandStrategy.visualVibe.mood}.
    //   Photography style: ${brandStrategy.visualVibe.photographyStyle}.
    //   Colors: ${brandStrategy.visualVibe.colorPalette.join(", ")}.
    //   Typography hint: ${brandStrategy.visualVibe.typography}.
    //   Scenario: ${item.scenario}.
    //   Idea: ${item.idea}.
    // `.trim()
    return `
      Brand personality: ${brandStrategy.brandPersonality}.
      Mood: ${brandStrategy.visualVibe.mood}.
      Photography style: ${brandStrategy.visualVibe.photographyStyle}.
      Typography hint: ${brandStrategy.visualVibe.typography}.
      Scenario: ${item.scenario}.
      Idea: ${item.idea}.
    `.trim()
}

interface ImageProps extends BaseProps {
    category: keyof typeof promptTemplates
    subcategory: string
}

export const generateImagePrompt = (
    {
        brandStrategy,
        item,
        category,
        subcategory
    }: ImageProps
) => {
    const vibePrompt = generateBaseContentPrompt({brandStrategy, item})
    // @ts-ignore
    const brandTemplates = promptTemplates[category]?.[subcategory]
    if (!brandTemplates || brandTemplates.length === 0) {
        throw new Error(`No templates found for ${category}.${subcategory}`)
    }
    const template = brandTemplates[Math.floor(Math.random() * brandTemplates.length)]

    return `
        Input
        image for ${item.type}.
        Brand Style Guide: ${vibePrompt}
        It should visually communicate the goal: "${item.goal}".
        Creative template: ${template}
        Output:
        Generate a single Seedream 4 prompt that blends the brand style, scenario, and template into one coherent image description, optimized for realism and Instagram aesthetics.
      `.trim()
}