import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  freeLimit: {
    type: Number,
    default: 5000,
    required: true,
  },
  // You can add more settings fields as needed.
  // e.g., subscriptionCost: { type: Number, default: 100, required: true },
});

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export const Settings = mongoose.model("Settings", settingsSchema);
