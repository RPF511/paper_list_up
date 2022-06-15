import ResearchPaperData from "../models/ResearchPaperData";
import ResearchPaperLink from "../models/ResearchPaperLink";

import Crawler from "crawler";



let singleDataCrawler = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});


export const home = async(req, res) => {
    // promise
    try{
        return res.render("home", {pageTitle : "Home"});
    } catch(error){
        return res.status(404).render("server-errors");
    }
    
}


export const search = async(req,res) => {
    const {keyword} = req.query;
    let paper = [];
    if(keyword) {
        paper = await ResearchPaperData.find({
            title: {
                //mongodb operator
                $regex: new RegExp(keyword, "i"),
            },
        })
        
    }
    return res.render("data/search", {pageTitle:"Search", paper});
    
}


export const crawl = async(req,res) => {
    const { title } = req.body
    let url = 
    singleDataCrawler.queue(title);



    return
}