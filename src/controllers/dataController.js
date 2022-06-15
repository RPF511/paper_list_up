import ResearchPaperData from "../models/ResearchPaperData";
import ResearchPaperLink from "../models/ResearchPaperLink";

import axios from "axios";
import cheerio from "cheerio";
import { compileClient } from "pug";


// let singleDataCrawler = new Crawler({
//     maxConnections : 10,
//     // This will be called for each crawled page
//     callback : function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//             var $ = res.$;
//             // $ is Cheerio by default
//             //a lean implementation of core jQuery designed specifically for the server
//             console.log($("title").text());
//         }
//         done();
//     }
// });


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


async function crawlIEEE(result) {
    try{
        const response = await axios.get(result["url"]);
        // console.log(response);
        const $ = await cheerio.load(response.data);
        result["citations"] = Number($("body").find(".document-banner-metric-count").text());
        result["INSPEC"] = Number($("body").find(".u-pb-1").text());
        result["DOI"] = $("body").find(".stats-document-abstract-doi").text();
        
        console.log(result);

    } catch(err){
        console.log(err);
    }
    
}


export const crawl = async(req,res) => {
    const { title } = req.body
    
    let url = "https://scholar.google.com/scholar?hl=ko&as_sdt=0%2C5&q=" + encodeURI(title).replace(/%20/g,"+").replace(/,/g ,"%2C").replace(/:/g,"%3A") + "&btnG=";
    // console.log(url);
    let result = {};
    let crawl = false;
    // let dataExists = false;
    let linkExists = false;
    let complete = false;
    let dataSave = false;
    try{
        const response = await axios.get(url);
        // console.log(response);
        const $ = await cheerio.load(response.data);
        console.log($("body").find(".gs_rt").first().text());
        if(title.toLowerCase().trim() == $("body").find(".gs_rt").first().text().toLowerCase().trim()){
            result["title"] = $("body").find(".gs_rt").first().text();
            result["author"] = $("body").find(".gs_a").first().text();
            result["publisher"] = $("body").find(".gs_or_ggsm").first().text().split("] ")[1].split(".")[0];
            console.log($("body").find(".gs_fl").text().slice(10,40));
            result["citations"] = Number($("body").find(".gs_fl").text().slice(10,40).replace( /\D/g, ''));
            result["url"] = $.root().html().split('class="gs_rt"')[1].split('href="')[1].split('"')[0];
            crawl = true;
            // console.log(result);
        }
    } catch(err) {
        console.log(err);
    }
    if(crawl){
        let urls = await ResearchPaperData.find({
            url: {
                //mongodb operator
                $regex: new RegExp(result["url"], "i"),
            },
        })
        if(urls.length > 0){
            // dataExists = true;
            for(let i = 0; i<urls.length;i++){
                let linkData = await ResearchPaperLink.findOne({ data_id: urls[i]._id});
                if(urls[i].DOI){
                    complete = true;
                }
                if(linkData){
                    linkExists=true;
                }
            }
            if(linkExists){
                return res.status(400).render("data/search", {pageTitle: "Search", errorMessage:"data exists"});
            }
        }
        if(!complete){
            if(result["publisher"].includes("ieee")){
                dataSave = true;
                result = await crawlIEEE(result);
            }
        }
    }
    
    
    // console.log(result);


    return res.redirect("./search");
}