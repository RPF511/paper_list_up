// import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    res.locals.siteName = "Research_Paper_List_Up"

    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    //console.log(res.locals.loggedInUser)
    next();
};

export const protectorMiddleware = (req, res, next) => { 
    if(req.session.loggedIn){
        return next();
    } else{
        req.flash("error", "Log In First");
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req,res,next) =>{
    if(!req.session.loggedIn){
        return next();
    } else{
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};