export const home = async(req, res) => {
    // promise
    try{
        return res.render("home", {pageTitle : "Home"});
    } catch(error){
        return res.status(404).render("server-errors");
    }
    
}