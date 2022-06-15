import ResearchPaperData from "../models/ResearchPaperData";
import ResearchPaperLink from "../models/ResearchPaperLink";

import axios from "axios";
import cheerio from "cheerio";


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

function delay(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
            resolve();
        },ms);
    });
}

function getHTML(url) {
    return new Promise(resolve=>{
        delay(100).then(function() {
            axios.get(url).then(function(data) {
                resolve(data);
            });
        });
    })    
}

function getDataFromScholar(url) {
    getHTML(url).then(html => {
        const $ = cheerio.load(html.data);
        let result = {};
        result["title"] = $("body").find(".gs_rt").first().text();
        result["author"] = $("body").find(".gs_a").first().text();
        result["publisher"] = $("body").find(".gs_or_ggsm").first().text();
        result["url"] = $.root().html().split('class="gs_rt"')[1].split('href="')[1].split('"')[0];
        
        
        return result
    });
}

// function makeJSON(workList) {
//     getHTML(workList[cnt]).then(html => {
//         let result = {};
//         const $ = cheerio.load(html.data);
//         result['title'] = $("body").find(".search_tit").text();
//         result['date'] = $("body").find(".tit_loc").text();
//         result['content_trans'] = $("body").find(".ins_view_pd").find(".paragraph").eq(0).text();
//         result['content_origin'] = $("body").find(".ins_view_pd").find(".paragraph").eq(1).text();
//         return result;
//     })
//     .then(res => {
//         cnt++;
//         resultList.push(res);
//         if(workList.length == cnt){
//             fs.writeFile('result_json.txt', JSON.stringify(resultList), 'utf8', function(error){
//                 console.log('write end');
//             });
//         } else {
//             makeJSON(workList);
//         }
//         console.log(cnt);
//     });
// }



export const crawl = async(req,res) => {
    const { title } = req.body
    
    let url = "https://scholar.google.com/scholar?hl=ko&as_sdt=0%2C5&q=" + encodeURI(title).replace(/%20/g,"+").replace(/,/g ,"%2C").replace(/:/g,"%3A") + "&btnG=";
    getDataFromScholar(url,title);
    console.log(getHTML(url));
    console.log(result);
    // const  $ = await Cheerio.load(urlData.data);
    // console.log(urlData);


    return res.redirect("./search");
}