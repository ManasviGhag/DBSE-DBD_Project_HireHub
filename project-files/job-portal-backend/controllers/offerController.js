import OfferLetter from "../models/OfferLetter.js";
import Application from "../models/Application.js";

const EDITABLE_OFFER_FIELDS = [
  "position",
  "company",
  "joiningDate",
  "employmentType",
  "workLocation",
  "salary",
  "reportingTo",
  "offerExpiry",
  "additionalTerms",
];

function populateOffer(query) {
  return query.populate("candidate", "name email").populate("recruiter", "name email");
}

// Recruiters may only act on their own jobs; admins on any.
function ownsJob(req, job) {
  return req.user.role === "admin" || job?.postedBy?.toString() === req.user.id;
}

export async function createOffer(req, res) {
  try {
    const { applicationId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "applicationId is required" });

    const application = await Application.findById(applicationId).populate("job", "postedBy");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (!ownsJob(req, application.job)) {
      return res.status(403).json({ message: "You can only send offers for jobs you posted" });
    }
    if (application.status !== "hired") {
      return res.status(400).json({ message: "Offer letters can only be sent for hired applications" });
    }
    if (await OfferLetter.exists({ application: application._id })) {
      return res.status(409).json({ message: "An offer letter already exists for this application" });
    }

    const fields = {};
    for (const field of EDITABLE_OFFER_FIELDS) {
      if (req.body[field] !== undefined) fields[field] = req.body[field];
    }

    const offer = await OfferLetter.create({
      ...fields,
      application: application._id,
      candidate: application.candidate,
      job: application.job._id,
      recruiter: req.user.id,
      status: "sent",
      sentAt: new Date(),
    });

    const populated = await populateOffer(OfferLetter.findById(offer._id));
    return res.status(201).json({ offer: populated });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("[createOffer]", err);
    return res.status(500).json({ message: "Could not create offer letter" });
  }
}

// Returns { offer: null } when none exists yet, so callers don't have to treat that as an error.
export async function getOfferForApplication(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId).populate("job", "postedBy");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (req.user.role === "candidate") {
      if (application.candidate.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only view your own offer letters" });
      }
    } else if (!ownsJob(req, application.job)) {
      return res.status(403).json({ message: "You can only view offers for jobs you posted" });
    }

    const offer = await populateOffer(OfferLetter.findOne({ application: application._id }));
    return res.json({ offer });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid application id" });
    console.error("[getOfferForApplication]", err);
    return res.status(500).json({ message: "Could not load offer letter" });
  }
}

export async function getCandidateOffers(req, res) {
  try {
    const offers = await populateOffer(
      OfferLetter.find({ candidate: req.user.id, status: "sent" })
    ).sort({ sentAt: -1 });
    return res.json({ offers });
  } catch (err) {
    console.error("[getCandidateOffers]", err);
    return res.status(500).json({ message: "Could not load offer letters" });
  }
}

// Timestamp-only "resend" — no email is actually delivered.
export async function resendOffer(req, res) {
  try {
    const offer = await OfferLetter.findById(req.params.id).populate("job", "postedBy");
    if (!offer) return res.status(404).json({ message: "Offer letter not found" });

    if (!ownsJob(req, offer.job)) {
      return res.status(403).json({ message: "You can only resend offers for jobs you posted" });
    }

    offer.status = "sent";
    offer.sentAt = new Date();
    await offer.save();

    const populated = await populateOffer(OfferLetter.findById(offer._id));
    return res.json({ offer: populated });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid offer id" });
    console.error("[resendOffer]", err);
    return res.status(500).json({ message: "Could not resend offer letter" });
  }
}
