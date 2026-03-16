const axios = require("axios");
const mongoose = require("mongoose");
const openai = require("../config/opeai.js");
const imagekitinstance = require("../config/imagekit.js");
const User = require("../models/usermodel.js");
const Chat = require("../models/chat.js");


const textmessagecontroller = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.body;
        const prompt = req.body.prompt?.trim();
        
        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ success: false, message: "Valid chatId is required" });
        }

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        if (req.user.credits < 1) {
            return res.status(400).json({ success: false, message: "Not enough credits to generate content" });
        }

        const chat = await Chat.findOne({ userId: String(userId), _id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
            ispublished: false,
        });


        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const providerMessage = choices?.[0]?.message;
        const replyContent = Array.isArray(providerMessage?.content)
            ? providerMessage.content
                .map((part) => typeof part === "string" ? part : part?.text || "")
                .join("\n")
                .trim()
            : providerMessage?.content;

        if (!replyContent) {
            throw new Error("AI provider returned an empty response");
        }

        const reply = {
            role: "assistant",
            content: replyContent,
            timestamp: Date.now(),
            isImage: false,
            ispublished: false,
        };

        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

        res.status(200).json({ success: true, message: "Message processed successfully", reply });

        

    }
    catch (err) {
        const statusCode = err.name === "CastError" ? 400 : err.status || 500;
        let message = err.message || "Error processing message";

        if (statusCode === 400) {
            message = "Invalid chatId";
        }

        if (statusCode === 429) {
            message = "AI provider rate limit or quota exceeded. Please try again later or check your Gemini API quota.";
        }

        res.status(statusCode).json({ success: false, message, error: err.message });
    }
}

// User Prompt
//      ↓
// Encode prompt for URL
//      ↓
// Create ImageKit AI generation URL
//      ↓
// Axios downloads generated image
//      ↓
// Binary → Base64 conversion
//      ↓
// Upload image to ImageKit storage
//      ↓
// Get public image URL
//      ↓
// Create assistant reply object
//      ↓
// Send image URL to frontend

const imagemessagecontroller = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, ispublished, ispublish } = req.body;
        const prompt = req.body.prompt;
        const shouldPublish = typeof ispublished === "boolean" ? ispublished : Boolean(ispublish);

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        if(req.user.credits < 1){
            return res.status(400).json({ success: false, message: "Not enough credits to generate image" });
        }

        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
            ispublished: false,
        });

        // This converts the prompt into a URL-safe format.
        const encodedprompt = encodeURIComponent(prompt);

        // Creates a dynamic URL that tells ImageKit to generate an image. 
        // The URL includes the encoded prompt and a unique filename based on the current timestamp. 
        // The transformation parameters (tr=w-800,h-800) specify that the generated image should be resized to 800x800 pixels.
        const generatedimageurl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedprompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;


        const base64image = Buffer.from((await axios.get(generatedimageurl,{responseType:'arraybuffer'})).data,'binary').toString('base64');

        const uploadresponse = await imagekitinstance.upload({
            file: `data:image/png;base64,${base64image}`,
            fileName: `quickgpt-${Date.now()}.png`,
            folder: "quickgpt",
        });

        //upload response contains the URL of the uploaded image in ImageKit storage.
        //  This URL is then used to create a reply object that is sent back to the frontend and also stored in the chat history in the database.
        //  The user is charged credits for generating the image, and the chat history is updated with both the user's prompt and the assistant's reply containing the image URL.
        const reply = {
            role: "assistant",
            content: uploadresponse.url,
            timestamp: Date.now(),
            isImage: true,
            ispublished: shouldPublish,
        };

        res.status(200).json({ success: true, message: "Image generated and uploaded successfully", reply });
        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({_id:userId},{$inc:{credits:-1}});
        

    }
    catch (err) {
        const statusCode = err.name === "CastError" ? 400 : err.status || 500;
        let message = err.message || "Error processing message";

        if (statusCode === 400) {
            message = "Invalid chatId";
        }

        if (statusCode === 429) {
            message = "AI provider rate limit or quota exceeded. Please try again later or check your ImageKit or Gemini API quota.";
        }

        res.status(statusCode).json({ success: false, message, error: err.message });
    }  
}

module.exports = { textmessagecontroller, imagemessagecontroller };