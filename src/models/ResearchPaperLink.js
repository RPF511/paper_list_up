import mongoose from "mongoose";

//export const formatHashtags = (hashtags) => hashtags.split(",").map((word) => word.startsWith('#') ? word : `#${word}`);

const researchPaperLinkSchema = new mongoose.Schema({
    id : { type: mongoose.Schema.Types.ObjectId, required:true },
    refernce : [{ type: mongoose.Schema.Types.ObjectId, trim: true }],
});

// videoSchema.pre('save', async function() {
//   this.hashtags = this.hashtags[0]
//   .split(",")
//   .map((word) => word.startsWith('#') ? word : `#${word}`);
// });

// videoSchema.static('formatHashtags', function(hashtags) {
//   return hashtags.split(",").map((word) => word.startsWith('#') ? word : `#${word}`);
// })

const ResearchPaperLink = mongoose.model("ResearchPaperLink", researchPaperLinkSchema); 
export default ResearchPaperLink;