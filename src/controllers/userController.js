import User from "../models/User";

import fetch from "node-fetch";

export const see = async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate("videos");;
    if(!user){
        return res.status(404).render("404", {pageTitle: "User not Found"});
    }

    return res.render("users/profile", {pageTitle: `${user.name}`, user});
};

export const getJoin = (req, res) => res.render("users/join",{ pageTitle: "Join"});

export const postJoin = async (req, res) => {
    const pageTitle = "Join";
    const {name, username,email,password,passwordCheck,location} = req.body;
    let usernameError = "";
    let emailError = "";
    let passwordError = "";
    let errorExists = 0;
    //const exists = await User.exists({$or: [{username},{email}]} );
    if(await User.exists({username})){
        usernameError= "this username is already taken";
        errorExists = 1;
    }
    if(await User.exists({email})){
        emailError= "this email is already taken";
        errorExists = 1;
    }
    if(password !== passwordCheck){
        passwordError = "password does not match";
        errorExists = 1;
    }
    if(errorExists){
        return res.status(400).render("users/join", {pageTitle: "Join", usernameError,emailError,passwordError, name,username,email,location});
    }
    try{
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    }catch(error){
        return res.status(400).render("users/join", {pageTitle: "Join", errorMessage : error._message});
    }
    
};

export const getLogin = (req, res) => res.render("users/login",{ pageTitle: "Login"});

export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({username});
    if (!user){
        return res.status(400).render("users/login",{pageTitle, errorMessage:"An account with this username doesn't exists."});
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("users/login",{pageTitle, errorMessage:"Wrong PassWord."});
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        //allow_signup:false,
        scope: "read:user user:email",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl)
};

export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method:"POST",
            headers:{
                Accept: "application/json",
            },
        })
    ).json();
    //res.send(JSON.stringify(json));
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers:{
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers:{
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find( (email) => email.primary === true && email.verified === true);
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email});
        if(!user){
            const user = await User.create({
                avatarUrl : userData.avatar_url,
                name : userData.name,
                username : userData.login,
                email : emailObj.email,
                password : "",
                socialOnly : true,
                location : userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }else {
        return res.redirect("/login");
    }
};

export const getEdit = (req, res) => {
    return res.render("users/edit-profile", { pageTitle: "Edit Profile", name:req.session.user.name, email:req.session.user.email, username:req.session.user.username, location:req.session.user.location});
};

export const postEdit = async(req, res) => {
    //let errorMessages = { usernameError :"" ,emailError :"" ,passwordError :""};
    let usernameError ="";
    let emailError ="";
    let passwordError ="";
    let errorExists = 0;


    const {
        session: {
            user: { _id, avatarUrl },
        },
        body:{ name,email,username,location,password },
        file,
    } = req;

    const currentUser =  await User.findById(_id);
    const ok = await bcrypt.compare(password, currentUser.password);
    if(!ok){
        passwordError = "Wrong PassWord";
        errorExists = 1;
    }
    if ((currentUser.email !== email) && (await User.exists({ email }))) {
        emailError = "this email is already taken";
        errorExists = 1;
    }
    if ((currentUser.username !== username) && (await User.exists({ username }))) {
        usernameError = "this username is already taken";
        errorExists = 1;
    }
    if(errorExists){
        console.log(usernameError);
        console.log(emailError);
        console.log(passwordError);
        return res.status(400).render("users/edit-profile", {pageTitle: "Edit Profile", usernameError,emailError,passwordError, name,email,username,location});
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email,
        username,
        location
    }, 
    //without this option, user.findByIdAndUpdate will return old object
    {new: true}
    );
    //req.session.user = updatedUser;

    // req.session.user = {
    //     ...req.session.user,
    //     name,
    //     email,
    //     username,
    //     location,
    // };
    return res.redirect("/users/edit");
};

export const remove = (req, res) => res.send("Remove User");

export const search = (req, res) => res.send("Search");

export const logout = (req, res) => {
    try{
        req.session.destroy();
    } catch(error){
        return res.status(400).render("/", {pageTitle: "Home", errorMessage : error._message});
    }
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    return res.render("users/change-password", {pageTitle:"Change Password"});
};

export const postChangePassword = async(req, res) => {
    let errorExists = 0;
    let passwordError = "";
    let passwordCheckError = "";

    const {
        session: {
            user: { _id, password },
        },
        body:{ passwordOld, passwordNew, passwordNewCheck } 
    } = req;
    const currentUser =  await User.findById(_id);

    const ok = await bcrypt.compare(passwordOld, currentUser.password);

    if(!ok){
        passwordError = "Wrong Password";
        errorExists = 1;
    }
    if(passwordNew !== passwordNewCheck){
        passwordCheckError = "Password does not match";
        errorExists = 1;
    }
    if(errorExists){
        return res.status(400).render("users/change-password", {pageTitle: "change-password",passwordError, passwordCheckError});
    }
    
    currentUser.password = passwordNew;
    currentUser.save();
    req.session.user.password = currentUser.password;
    return res.redirect("/users/logout");
};