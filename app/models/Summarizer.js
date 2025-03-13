import mongoose from "mongoose";

const summarizerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  keyPoints: {
    type: [String],
    required: true,
  },
  historyPreview: {   // Stores a short preview (4-5 words)
    type: String,
    required: true,
  },
  freeDailySummariesLeft: {  // Stores the free daily summaries left
    type: Number,
    required: true,
  },
  isDeleted: {  // New field to mark a summary as deleted
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.Summarizer) {
  delete mongoose.models.Summarizer;
}
export const Summarizer = mongoose.model("Summarizer", summarizerSchema);
