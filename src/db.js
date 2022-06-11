import mongoose from "mongoose";

// mongoose.connect(process.env.DB_URL, 
// { 
//     useNewUrlParser: true ,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// }
// );
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const handleOpen = () => console.log("Connected to DB");
const handleError = (error) => console.log("DB Error",error);

db.on("error", handleOpen);
db.once("open", handleOpen);   