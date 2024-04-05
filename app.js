const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const bcrypt = require("bcrypt");
const alert = require("alert");
const fs = require("fs");

const app = express();
const saltRounds = 2;

var userLog = false;
var govLog = false;
var projCount = 100;
var matchedArr;
var flag = 0;
var serialNo;
var months = [];
var completeArr = [];
var selectedOpt;
var iNo = 0;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/byteKarmaDB");

let jsonData = fs.readFileSync('PPP.json');
let jsData = JSON.parse(jsonData);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const govSchema = new mongoose.Schema({
    email: String, 
    password: String
});

const projSchema = new mongoose.Schema({
    srNo : Number,
    projectName: String,
    projectCapacity: String,
    projCost: String,
    sector: String,
    subSector: String,
    status: String,
    projAuth: String,
    location: String,
    updateDate: String,
    startDate: String,
    endDate: String,
    tenure: String,
    projectDesc: String,
});

const feedbackSchema = new mongoose.Schema({
    srNoFeed: Number,
    name:String,
    description:String,
    noOfStars:Number,
    imgname:String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});

const chartSchema = new mongoose.Schema({
    srNoChart: Number,
    xaxisVal: Array,
    yaxisVal: Array
});

const issueSchema = new mongoose.Schema({
    issueNo: Number,
    name: String,
    state: String,
    dept: String,
    mail: String,
    subject: String,
    issueDesc: String
});

  

const User = mongoose.model("User", userSchema);
const Government = mongoose.model("Government", govSchema);
const projInfo = mongoose.model("projInfo",projSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Chart = mongoose.model("Chart", chartSchema);
const reportedIssue = new mongoose.model("reportedIssue", issueSchema);

// for(var i = 0; i < jsData.length; i++){
//  let temp = {
//      srNo : (i+1),
//      projectName: jsData[i].Column2,
//      projectCapacity: jsData[i].Column3,
//      projCost: jsData[i].Column4,
//      sector: jsData[i].Column5,
//      subSector: jsData[i].Column6,
//      status: jsData[i].Column7,
//      projAuth: jsData[i].Column8,
//      location: jsData[i].Column9,
//      updateDate: jsData[i].Column10
//  }
//  console.log(temp);
//  const data = new projInfo(temp);
//  data.save();
// }



const Storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage:Storage
});

const Storage1 = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/tenders');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload1 = multer({ 
    storage:Storage1
});

//GET Home1
app.get("/", function(req, res) {
    res.render("home1.ejs");
});

// //GET User
app.get("/user", function(req, res) {
    res.render("user.ejs");
});

// //GET Government
app.get("/government", function(req, res) {
    res.render("government.ejs");
});

//GET Home2
app.get("/userHome", (req, res) => {
    res.render("userHome.ejs");
});

app.get("/user/login/home2", (req,res) => {
    res.render("home2.ejs", {userLoggedIn: userLog, govLoggedIn: govLog});
});

app.get("/govHome", (req, res) => {
    res.render("govHome.ejs");
});

app.get("/government/login/home2", (req,res) => {
    res.render("home2.ejs", {userLoggedIn: userLog, govLoggedIn: govLog});
});

app.get("/governmentIssue",async (req,res) => {
    const issueMatched = await reportedIssue.find({dept: selectedOpt}); 
    res.render("govIssue.ejs", {issues: issueMatched});
  }); 

// //GET Infra
app.get("/user/login/home2/infra", async(req,res) => {
    if(flag === 0){
        matchedArr = await projInfo.find({});
    }
    //console.log(matchedArr);
    // console.log(userLog);
    // console.log(govLog);
    res.render("infraProj.ejs", {stateList: states, sectorList: sectors, projData: matchedArr, userLoggedIn: userLog, govLoggedIn: govLog});
});

app.get("/government/login/home2/infra", async(req,res) => {
    if(flag === 0){
        matchedArr = await projInfo.find({});
    }
    //console.log(matchedArr);
    // console.log(userLog);
    // console.log(govLog);
    res.render("infraProj.ejs", {stateList: states, sectorList: sectors, projData: matchedArr, userLoggedIn: userLog, govLoggedIn: govLog});
});

//GET Report Issue Page
app.get("/report", (req,res) => {
    res.render("report.ejs",{govtDept: sectors, stateList: states});
});

app.get("/addNewProject", function(req, res) {
    res.render("govAddProj.ejs", {states: states, sectorList:sectors});
});

//GET Individual Project
app.get("/:srNo", async (req, res) => {
    if(req.params.srNo !== "favicon.ico"){
        serialNo = req.params.srNo;
        var matchedArr1 = await projInfo.find({srNo: serialNo})
        var matchedArr2 = await Feedback.find({srNoFeed: serialNo});
        var matchedArr3 = await Chart.find({srNoChart: serialNo});
        console.log(matchedArr3);
        if(matchedArr3.length === 0){
            res.render("projDisplay.ejs", {info: matchedArr1, info1: matchedArr2, info2: [], info3: [], userLoggedIn: userLog, govLoggedIn: govLog});    
        }
        else{
            res.render("projDisplay.ejs", {info: matchedArr1, info1: matchedArr2, info2: matchedArr3[0].xaxisVal, info3: matchedArr3[0].yaxisVal, userLoggedIn: userLog, govLoggedIn: govLog});
        }
    }
});


app.get("/gov/:srNo",async (req, res) => {
    serialNo = req.params.srNo;
    let matchedArr1 = await projInfo.find({srNo: serialNo});
    let matchedArr2 = await Feedback.find({srNoFeed: serialNo});
    let matchedArr3 = await Chart.find({srNoChart: serialNo});
    console.log(matchedArr3);
    if(matchedArr3.length === 0){
        res.render("projDisplayGov.ejs", {info: matchedArr1, info1: matchedArr2, info2: [], info3: []});    
    }
    else{
        res.render("projDisplayGov.ejs", {info: matchedArr1, info1: matchedArr2, info2: matchedArr3[0].xaxisVal, info3: matchedArr3[0].yaxisVal});
    }
});

app.post("/user/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        const checkUser = req.body.username;
        User.findOne({email: checkUser}).then(function(foundUser){
            if(foundUser){
                res.send("Already exists");
            }
            else{
                newUser.save().then(function() {
                    userLog = true;
                    govLog = false;
                    res.redirect("/user");
                }).catch(function(err) {
                    console.log(err);
                });
            }
        })
    })
});

app.post("/user/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then(function(foundUser){
        if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result){
                if(result === true){
                    userLog = true;
                    govLog = false;
                    res.redirect("/userHome");
                }
            });
        }
    }).catch(function(err){
        console.log(err);
    });
});

app.post("/government/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        const newGov = new Government({
            email: req.body.username,
            password: hash
        });
        const checkUser = req.body.username;
        Government.findOne({email: checkUser}).then(function(foundUser){
            if(foundUser){
                res.send("Already exists");
            }
            else{
                newGov.save().then(function() {
                    userLog = false;
                    govLog = true;
                    res.redirect("/government")
                }).catch(function(err) {
                    console.log(err);
                });
            }
        })
        
    })
});

app.post("/government/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    Government.findOne({email: username}).then(function(foundUser){
        if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result){
                if(result === true){
                    userLog = false;
                    govLog = true;
                    res.redirect("/govHome")
                }
            });
        }
    }).catch(function(err){
        console.log(err);
    });
});

app.post("/user/login/home2/infra", async (req,res) =>{
    const state = req.body.state;
    const inputSector = req.body.sector;
    console.log(state)
    console.log(inputSector);
    flag++;
    if(inputSector  === "None"){
      matchedArr = await projInfo.find({location: state});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
          res.redirect("/user/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/user/login/home2/infra");
      }
    }
    else if(state === "None"){
      matchedArr = await projInfo.find({sector: inputSector});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
        res.redirect("/user/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/user/login/home2/infra");
      }
    }
    else{
      matchedArr = await projInfo.find({location: state, sector: inputSector});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
        res.redirect("/user/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/user/login/home2/infra");
      }
    }
});


app.post("/government/login/home2/infra", async (req,res) =>{
    const state = req.body.state;
    const inputSector = req.body.sector;
    console.log(state)
    console.log(inputSector);
    flag++;
    if(inputSector  === "None"){
      matchedArr = await projInfo.find({location: state});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
          res.redirect("/government/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/government/login/home2/infra");
      }
    }
    else if(state === "None"){
      matchedArr = await projInfo.find({sector: inputSector});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
        res.redirect("/government/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/government/login/home2/infra");
      }
    }
    else{
      matchedArr = await projInfo.find({location: state, sector: inputSector});
      console.log(matchedArr);
      if(matchedArr.length !== 0){
        res.redirect("/government/login/home2/infra");
      }
      else{
          matchedArr = await projInfo.find({});
          res.redirect("/government/login/home2/infra");
      }
    }
});

app.post("/addNewProject", function(req, res) {
    projCount++;
    const newProject = new projInfo({
        srNo: projCount,
        projectName: req.body.projName,
        projectCapacity: req.body.projCap,
        projCost: req.body.projCost,
        sector: req.body.projSector,
        subSector: req.body.projSubSect,
        status: req.body.Stat,
        projAuth: req.body.projAuth,
        location: req.body.state,
        startDate: req.body.projDate,
        endDate: req.body.projEst,
        tenure: req.body.tenure,
        projectDesc: req.body.projDesc
    });
    newProject.save();
    res.redirect("/government/login/home2/infra");
});

app.post("/submitFeedback", upload.single("image"), function(req, res) {
    const newFeedback = new Feedback ({
        srNoFeed: serialNo,
        name:req.body.userName,
        description:req.body.userDesc,
        noOfStars:Number(req.body.rating),
        imgname: res.req.file.filename,
        img: {
            data: req.file.filename,
            contentType:'image/png'
        }
    });
    newFeedback.save();
    res.redirect("/"+serialNo);
});

app.post("/trackprogress", async function(req, res) {
    months.push(req.body.month);
    completeArr.push(req.body.percent); 
    const chartFound = await Chart.find({srNoChart: serialNo});
    if(chartFound.length === 0){
        const newChart = new Chart ({
            srNoChart: serialNo,
            xaxisVal: months,
            yaxisVal: completeArr
        });
        newChart.save();
    } else {
        const storeX = await Chart.updateOne({srNoChart: serialNo}, {$push: {xaxisVal: req.body.month}});
        const storeY = await Chart.updateOne({srNoChart: serialNo}, {$push: {yaxisVal: req.body.percent}});
        console.log(storeX);
        console.log(storeY);
    }
    months = [];
    completeArr = [];
    res.redirect("/" + serialNo);
});

app.post("/showIssues", (req,res) => {
    selectedOpt = req.body.deptSelected;
    console.log(selectedOpt);
    res.redirect("/governmentIssue");
});

app.post("/reportNewIssue", (req, res) => {
    iNo++;
    console.log(req.body);
    const data = req.body;
    const issue = new reportedIssue(data);
    issue.save();
    res.redirect("/userHome");
});

app.post("/uploadPDF", upload1.single('tender'), (req, res) => {
    console.log(req.file.filename);
    res.redirect("addNewProject");
})

app.post('/uploadPDF', upload1.single('tender'), function (req, res) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    console.log(req.file.filename);
    res.redirect("addNewProject");
  })

app.listen(3000, function() {
    console.log("Server started on 3000")
});

var states = [
    "None",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry"
]

var sectors = [
    "None",
    "Transport",
    "Water\xa0Sanitation",
    "Energy",
    "Social\xa0and\xa0Commercial\xa0Infrastructure"
]

// var dept = [
//   "None",
//   "Agriculture, Rural and Environment",
//   "Education and Learning",
//   "Electricity, Water and Local Services",
//   "Health and Wellness",
//   "Science, IT and Communication",
//   "Transport and Infrastrucure",
//   "Travel and Tourism",
//   "Youth, Sports and Culture",
//   "Others"
// ]

// var govtMinistries = [ 
//   "Ministry of Agriculture",
//   "Ministry of Rural Development",
//   "Ministry of Chemicals & Fertilizers",
//   "Ministry of Science & Technology",
//   "Ministry of Water Resources",
//   "Ministry of Urban Development",
//   "Ministry of Health & Family Welfare",
//   "Ministry of Communications & Information Tech.",
//   "Ministry of Road Transport & Highways",
//   "Ministry of Railways",
//   "Ministry of Tourism",
//   "Ministry of Youth Affairs & Sports"
// ]

