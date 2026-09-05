import "dotenv/config";

const getGeminiAIAPIResponse = async (message, image = null) => {

    const parts = [];

    // Existing text message
    if (message && message.trim()) {
        parts.push({
            text: message
        });
    }

    // Optional image
    if (image) {
        parts.push({
            inline_data: {
                mime_type: image.mimeType,
                data: image.data
            }
        });
    }

    const options = {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ]
        })
    };

    try {

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
            options
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                "Gemini API request failed"
            );
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            throw new Error(
                "No response received from Gemini"
            );
        }

        return reply;

    } catch (err) {

        console.log(
            "Gemini API Error:",
            err
        );

        throw err;
    }
};

export default getGeminiAIAPIResponse;