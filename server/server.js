import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'

import chatboatRoutes from "./routes/chatboatroutes.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

//options
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
}

// Middlewares
app.use(cors(corsOptions))
app.use(clerkMiddleware())

app.use(express.json()); // <-- This parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Optional, for form data

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', express.json() , clerkWebhooks)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)

app.use("/api/chatboat", chatboatRoutes);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})