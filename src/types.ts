export type ID = string;

export interface BriefData {
    brand: {
        name: string;
        description?: string;
        goal: string;
        industry: string;
    };
    audience: {
        segments: string[];
        descriptor: string;
    };
    desiredAction: string;
    message: {
        core: string;
        emotion: string;
        // tone?: string;
    };
    visual: {
        vibe: string;
        artDirection: string;
    };
    kpis: {
        success: string;
    };
    musts?: string[];
    donts?: string[];
    products: {
        images: {
            fileName: string
            originalName: string
            url: string
        }[]
    }[]

}


export interface Brief {
    id: ID;
    clientName?: string;
    data: BriefData
    createdAt: string;
}

//

export interface BrandStrategy {
    strategyTitle: string;
    coreInsight: string;
    bigIdea: string;
    strategicObjectives: string[];
    targetAudience: {
        demographics: {
            age: string;
            gender: string;
            location: string;
        };
        psychographics: {
            interests: string[];
            values: string[];
        };
        mediaHabits: {
            platforms: string[];
            contentTypes: string[];
        };
    };
    brandPersonality: string;
    contentPillars: string[];
    visualVibe: {
        mood: string;
        colorPalette: string[];
        typography: string;
        photographyStyle: string;
    };
    platformStrategy: string;
    measurementKPIs: {
        followersGrowth: string;
        salesIncrease: string;
    };
}

export interface ContentCalendarItem {
    date: string; // format YYYY-MM-DD
    type: "post" | "story" | "reel";
    goal: string;
    idea: string;
    scenario: string;
    text: string;
    hashtags: string[];
}

export interface ContentPlan {
    monthlyStrategy: string;
    calendar: ContentCalendarItem[];
}

export interface BrandData {
    brandStrategy: BrandStrategy;
    contentPlan: ContentPlan;
}

//
// export interface StyleSession {
//     id: ID;
//     clientId: ID;
//     stepIndex: number;
//     answers: Record<string, any>;
//     questions: string[]; // очередь вопросов, сформированная на основе брифа
//     createdAt: string;
//     finished?: boolean;
//     preset?: StylePreset | null;
// }
//
// export interface StylePreset {
//     id: ID;
//     clientId: ID;
//     description: string;
//     basePromptTemplate: string; // template with {idea} placeholder
//     examples: string[];
//     createdAt: string;
// }
//
// export interface ContentItem {
//     id: ID;
//     date: string; // YYYY-MM-DD
//     type: "post" | "story" | "reel";
//     topic: string;
//     caption: string;
//     hashtags: string[];
//     prompt_en: string;
//     image_url?: string;
// }
//
// export interface ContentPlan {
//     id: ID;
//     clientId: ID;
//     month: string; // YYYY-MM
//     items: ContentItem[];
//     createdAt: string;
// }
