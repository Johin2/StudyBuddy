import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ["User", "System", "Assistant"],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        default: "New Chat",
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

if (mongoose.models.Chat) {
    delete mongoose.models.Chat;
}
export const Chat = mongoose.model("Chat", chatSchema);
