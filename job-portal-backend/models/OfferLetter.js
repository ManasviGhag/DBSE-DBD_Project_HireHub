import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    position: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    employmentType: { type: String, required: true, trim: true },
    workLocation: { type: String, trim: true },
    salary: { type: String, required: true, trim: true },
    reportingTo: { type: String, trim: true },
    offerExpiry: { type: Date, required: true },
    additionalTerms: { type: String, trim: true },

    status: { type: String, enum: ["draft", "sent"], default: "draft" },
    sentAt: { type: Date }, // set when sent; bumped by "resend"
  },
  { timestamps: true }
);

export default mongoose.model("OfferLetter", offerLetterSchema);
