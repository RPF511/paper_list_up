
import express from "express";
import session from "express-session";
import morgan from "morgan";

import rootRouter from "./routers/rootRouter";



const app = express();

const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true}));

app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninstialized: false,
        cookie: {
            maxAge: 864000000,
        },
        // store: MongoStore.create({mongoUrl: process.env.DB_URL}),
    })
);

app.use("/",rootRouter);



export default app;