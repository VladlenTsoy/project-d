import {Router} from "express";
import {Briefs, StylePresets, ContentPlans} from "../storage";

const router = Router();

router.get("/:clientId", (req, res) => {
    const clientId = req.params.clientId;
    const brief = Briefs[clientId];
    const preset = Object.values(StylePresets).find(s => s.clientId === clientId) ?? null;
    const plan = ContentPlans[clientId] ?? null;
    if (!brief) return res.status(404).json({error: "brief not found"});
    res.json({brief, preset, plan});
});

export default router;
