import { GoogleGenerativeAI } from "@google/generative-ai";

let conversationHistory = [
    { role: "system", content: "Give short, concise answers" }
];

export const chatboat = async(req, res) => {
    const userMessage = req.body.message;

    conversationHistory.push({ role: "user", content: userMessage });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GIMINIAI_API);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
        });

        // Add instruction to limit response length
        const prompt = `Respond to this very briefly in 1-2 lines: ${userMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const botResponse = await response.text();

        const formattedBotResponse = formatResponse(botResponse);

        conversationHistory.push({ role: "assistant", content: botResponse });

        return res.status(200).json({
            message: formattedBotResponse,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

function formatResponse(response) {
    return response.replace(/\*(.*?)\*/g, '$1');
}