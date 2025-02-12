import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, requried: true, unique:true},
    password: {type:String, required: true}
})

export const User = mongoose.models.User || mongoose.model("User", userSchema)