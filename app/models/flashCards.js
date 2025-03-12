import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

if (mongoose.models.Flashcard) {
    delete mongoose.models.Flashcard;
}
export const Flashcard = mongoose.model("Flashcard", flashcardSchema);
