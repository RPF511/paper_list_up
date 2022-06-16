import ResearchPaperData from "../models/ResearchPaperData";
import ResearchPaperLink from "../models/ResearchPaperLink";

import axios from "axios";
// import cheerio from "cheerio";
// import { Iconv } from "iconv";

// const iconv = new Iconv('CP949','utf-8//translit//ignore');

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
        // const $ = await cheerio.load(response.data);
        let htmlData = response.data.toString()
        result["publisher"] = "IEEE"
        // console.log(htmlData);
        result["date"] = htmlData.split("Date\":\"")[1].split("\"")[0].toString();

        result["citations"] = htmlData.split("citationCount\":\"")[1].split("\"")[0];
        
        result["INSPEC"] = Number(htmlData.split("accessionNumber\":\"")[1].split("\"")[0]);
        result["DOI"] = htmlData.split("doi\":\"")[1].split("\"")[0];
        result["author"] = [];

        const authorHtml = await axios.get(result["url"]+"/authors#authors");
        let authorData = authorHtml.data.toString().split("\"pdfPath\":\"")[0];
        // console.log(authorData);
        authorData = authorData.split("\"name\":\"");
        // console.log(authorData);
        for(let i = 1;i<authorData.length;i++){
            result["author"].push(authorData[i].split("\"")[0]);
        }

        
        return result;

    } catch(err){
        console.log(err);
    }
    
}

async function crawlSingle(title){
    let url = "https://www.google.com/search?q=" + encodeURI(title).replace(/%20/g,"+").replace(/,/g ,"%2C").replace(/:/g,"%3A");
    // console.log(url);
    let result = {};
    let crawl = false;
    let dataExists = false;
    let linkExists = false;
    let complete = false;
    let dataSave = false;
    try{
        const response = await axios.get(url);
        // console.log(response);
        // const $ = await cheerio.load(response.data);
        let divData = response.data.toString().split("<a href=\"/url?q=");
        // console.log(title.slice(0,30));
        // console.log(divData);
        for(let i = 0; i<3 ; i++){
            if(divData[i].includes(title.slice(0,30)) && divData[i].includes("DOI")){
                crawl = true;
                divData = divData[i];
                break;
            }
        }
        if(crawl){
            result["title"] = title;
            result["url"] = divData.split("&amp;")[0];
        }
        console.log(result);
    } catch(err) {
        result = {};
        result["error"] = "data error";
        return result;
    }

    if(crawl){
        let urls = await ResearchPaperData.find({
            url: {
                //mongodb operator
                $regex: new RegExp(result["url"], "i"),
            },
        })
        if(urls.length > 0){
            dataExists = true;
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
                result = {};
                result["error"] = "data exists";
                // return res.status(400).render("data/search", {pageTitle: "Search", errorMessage:"data exists"});
                return result;
            }
        }
        if(!complete){
            if(result["url"].includes("ieee")){
                dataSave = true;
                console.log(result);
                result = await crawlIEEE(result);
                // console.log(result);
            }
        }
        if(dataSave){
            if(dataExists){
                let newData = await ResearchPaperData.findOneAndUpdate({url:result["url"]}, result);
                result["id"]= newData._id;
                return result;
            }else{
                try {
                    let newData = await ResearchPaperData.create({
                        //title:title same since var name is same
                        title : result["title"],
                        author: result["author"],
                        //Date.now() : executed every time / Date.now : executed when created
                        date: result["date"],
                        INSPEC:result["INSPEC"],
                        DOI: result["DOI"],
                        citations: result["citations"],
                        publisher: result["publisher"],
                        url: result["url"],
                        keywords: [""],
                    });
                    result["id"] = newData._id;
                    return result;
                } catch(err){
                    result = {};
                    result["error"] = err.error._message;
                    return result;
                }
            }

            
        }
        
    }
    result = {};
    result["error"] = "crawl error";
    return result;
}

// async function findRef(result){
//     let idList = [];

// }

export const crawl = async(req,res) => {
    const { title } = req.body

    let result = await crawlSingle(title);
    console.log(result);

    if(result.hasOwnProperty('error')){
        return res.status(400).render("data/search", {pageTitle: "Search", errorMessage:result["error"]});
    }

    // if(result.hasOwnProperty('id')){
    //     findRef(result);
    // }
    
    
    // console.log(result);


    return res.redirect("./search");
}


// export const crawl = async(req,res) => {
//     const { title } = req.body
    
//     let url = "https://scholar.google.com/scholar?hl=ko&as_sdt=0%2C5&q=" + encodeURI(title).replace(/%20/g,"+").replace(/,/g ,"%2C").replace(/:/g,"%3A") + "&btnG=";
//     console.log(url);
//     let result = {};
//     let crawl = false;
//     // let dataExists = false;
//     let linkExists = false;
//     let complete = false;
//     let dataSave = false;
//     try{
//         const htmlData = await axios.get(url);
//         console.log(htmlData);
//         const $ = await cheerio.load(htmlData.data);
//         // console.log($("body").text());
//         console.log($("body").find(".gs_rt").first().text());


//         if(title.toLowerCase().trim() == $("body").find(".gs_rt").first().text().toLowerCase().trim()){
//             result["title"] = $("body").find(".gs_rt").first().text();
//             result["author"] = $("body").find(".gs_a").first().text();
//             result["publisher"] = $("body").find(".gs_or_ggsm").first().text().split("] ")[1].split(".")[0];
//             console.log($("body").find(".gs_fl").text().slice(10,40));
//             result["citations"] = Number($("body").find(".gs_fl").text().slice(10,40).replace( /\D/g, ''));
//             result["url"] = $.root().html().split('class="gs_rt"')[1].split('href="')[1].split('"')[0];
//             crawl = true;
            
//         }
//         console.log(result);
//     } catch(err) {
//         console.log(err);
//     }

//     if(crawl){
//         let urls = await ResearchPaperData.find({
//             url: {
//                 //mongodb operator
//                 $regex: new RegExp(result["url"], "i"),
//             },
//         })
//         if(urls.length > 0){
//             // dataExists = true;
//             for(let i = 0; i<urls.length;i++){
//                 let linkData = await ResearchPaperLink.findOne({ data_id: urls[i]._id});
//                 if(urls[i].DOI){
//                     complete = true;
//                 }
//                 if(linkData){
//                     linkExists=true;
//                 }
//             }
//             if(linkExists){
//                 return res.status(400).render("data/search", {pageTitle: "Search", errorMessage:"data exists"});
//             }
//         }
//         if(!complete){
//             if(result["publisher"].includes("ieee")){
//                 dataSave = true;
//                 result = await crawlIEEE(result);
//             }
//         }
//     }
    
    
//     console.log(result);


//     return res.redirect("./search");
// }