import {Router} from "express";
import {startStyleSession, answerStyleQuestion, buildPresetFromSession} from "../services/style.service";
import {Briefs} from "../storage";

const router = Router();

/**
 * init session: POST /styles/init/:clientId
 * returns session object with id and first question
 */
router.post("/init/:clientId", (req, res) => {
    const clientId = req.params.clientId;
    const brief = Briefs[clientId];
    if (!brief) return res.status(404).json({error: "brief not found for clientId"});
    const session = startStyleSession(clientId, brief);
    res.json({sessionId: session.id, question: session.questions[0]});
});

/**
 * answer question: POST /styles/answer/:sessionId
 * body: { answer: "..." }
 * returns next question or preset when finished
 */
router.post("/answer/:sessionId", async (req, res) => {
    const sessionId = req.params.sessionId;
    const answer = req.body.answer;
    try {
        const session = answerStyleQuestion(sessionId, answer);
        if (session.finished) {
            const preset = await buildPresetFromSession(sessionId);
            return res.json({finished: true, preset});
        } else {
            const nextQ = session.questions[session.stepIndex];
            return res.json({finished: false, question: nextQ, step: session.stepIndex});
        }
    } catch (e: any) {
        return res.status(400).json({error: e.message});
    }
});

export default router;
