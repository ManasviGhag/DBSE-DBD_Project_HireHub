import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, enum: ["candidate", "recruiter", "admin"], required: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
