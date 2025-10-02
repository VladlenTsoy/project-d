import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import briefRoutes from "./routes/brief";
import styleRoutes from "./routes/style";
import planRoutes from "./routes/contentPlan";
import resultRoutes from "./routes/result";
import replicateRoutes from "./routes/replicate";
import cors from "cors";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors())

app.use("/replicate", replicateRoutes);
app.use("/brief", briefRoutes);
app.use("/styles", styleRoutes);
app.use("/content-plans", planRoutes);
app.use("/result", resultRoutes);
app.use("/static", express.static("uploads"));
app.use("/images", express.static("images"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
