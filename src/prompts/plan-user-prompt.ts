import {Brief} from "../types"

interface Props {
    brief: Brief
    history_notes?: string[]
    month?: string[]
    posts_count?: number
    stories_count?: number
    reels_count?: number
}

export const generatePlanUserPrompt = (data: Props) => {
    const postsCount = data.posts_count || 1
    const storiesCount = data.stories_count || 1
    const reelsCount = data.reels_count || 1
    const month = data.month || 1
    const historyNotes = data.history_notes
    const briefData = data.brief.data

    return `# CLIENT BRIEF 
Month: ${month}  
Posting history (what was done in previous months): ${historyNotes}  

Content volume:
- Posts: ${postsCount}  
- Stories: ${storiesCount}  
- Reels: ${reelsCount}  

📋 Client Brief:
1) Brand & Goal
* Brand / product name: ${briefData.brand.name}  
* Product description: ${briefData.brand.description}  
* Main goal: ${briefData.brand.goal}  
* Industry: ${briefData.brand.industry}  

2) Audience
* Target audience: ${briefData.audience.segments}  
* Audience descriptor: ${briefData.audience.descriptor}  

3) Desired Action
* Primary action: ${briefData.desiredAction} 

4) Message & Emotion
* Core message: ${briefData.message.core}  
* Emotion: ${briefData.message.emotion}

5) Visual Vibe & Deliverables
* Visual vibe: ${briefData.visual.vibe}  
* Art direction: ${briefData.visual.artDirection}   

6) Success Measure (KPI)
* KPI: ${briefData.kpis.success}  

7) Musts & Don’ts
* Must-have: ${briefData.musts?.join(", ") || "empty"}
* Don’t: ${briefData.donts?.join(", ") || "empty"}  
`
}