import {Router} from "express";
import {v4 as uuid} from "uuid";
import {Briefs} from "../storage";

const router = Router();

/** Заполнение бриф */
router.post("/", (req, res) => {
    const id = uuid();
    const brief = {
        id,
        clientName: req.body.clientName || `client-${id}`,
        data: req.body.data || req.body,
        createdAt: new Date().toISOString()
    };
    Briefs[id] = brief;
    res.status(201).json(brief);
});

/** Получить бриф */
router.get("/:id", (req, res) => {
    const b = Briefs[req.params.id];
    if (!b) return res.status(404).json({error: "not found"});
    res.json(b);
});

export default router;
