import mongoose from "mongoose";

//export const formatHashtags = (hashtags) => hashtags.split(",").map((word) => word.startsWith('#') ? word : `#${word}`);

const researchPaperDataSchema = new mongoose.Schema({
    title: {type: String, required:true, trim: true, minLength:1, maxLength: 1000},
    author: [{type: String, required:true, trim: true, minLength:1, maxLength: 100}],
    //Date.now() : executed every time / Date.now : executed when created
    date: { type: Date , required:true, default: Date.now},
    INSPEC:{type:Number, required:true},
    DOI: { type: String, trim: true },
    citations: { type: Number, trim: true },
    publisher: { type: String, trim: true },
    url: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
});

// videoSchema.pre('save', async function() {
//   this.hashtags = this.hashtags[0]
//   .split(",")
//   .map((word) => word.startsWith('#') ? word : `#${word}`);
// });

// videoSchema.static('formatHashtags', function(hashtags) {
//   return hashtags.split(",").map((word) => word.startsWith('#') ? word : `#${word}`);
// })

const ResearchPaperData = mongoose.model("ResearchPaperData", researchPaperDataSchema); 
export default ResearchPaperData;