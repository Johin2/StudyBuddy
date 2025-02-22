import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // If you want to store a GridFS file id, use ObjectId:
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});

// Delete the model if it already exists
if (mongoose.models.User) {
  delete mongoose.models.User;
}
export const User = mongoose.model("User", userSchema);
