const express = require('express');
const axios = require('axios');
const serveStatic = require('serve-static');
const PORT = 3000;
const bodyParser = require("body-parser");
require('dotenv').config();
const {db} = require("./dbConfig");

const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/users/leaderboard",(req,res)=>{
    API_URL = "https://codeforces.com/api/user.info?handles=";

     db.query("Select * from Students",async(err,results)=>{
        if(err){ console.log(err)}
        else{
            results.rows.forEach(handle=>API_URL+=";"+handle.codeforces_handle);
            try {
                var students  = await axios.get(API_URL);
                stud_list = students.data.result;
                stud_list = quicksort(stud_list);
                res.render("Codeforces",{ress:stud_list});
            } catch (error) {
                console.log(error);
                res.redirect("/")
            }
            
        }
    }); 
});

app.get("/users/register", (req, res) => {
    res.render("register");
  });

app.post("/users/register",async(req,res)=>{
    let {rollNumber, studentName, codeforcesId} = req.body;
 
    let errors = [];
    if(!rollNumber || !studentName || !codeforcesId){
     errors.push({message:"Please Enter All Fields."})
    }

    //check if user exists
    try {
        let codeforcesRes = await axios.get("https://codeforces.com/api/user.info?handles="+codeforcesId);
    } catch (error) {
        errors.push({message:"Error occured while verifying codeforces id"});
    }
 
    if(errors.length>0){
     res.render("register",{errors});
    }else{
     //form validated
     db.query(`select * from Students where roll_number = $1`,[rollNumber.toUpperCase()],(err,results)=>{
         if(err){
             throw err;
         }else{
             if(results.rows.length>0){
             errors.push({message:"student already registerd"});
             res.render("register",{errors});
             }else{
                 db.query(`insert into Students (roll_number,student_name,codeforces_handle)values ($1,$2,$3)`,[rollNumber.toUpperCase(),studentName,codeforcesId],(errs,result)=>{
                     if(errs){throw errs}else{
                         res.redirect("/users/leaderboard");
                     }
                 });
             }
         }
     })
    }
 
 });


app.listen(PORT,()=>{console.log(`Server started at http://localhost:${PORT}`)});

function quicksort(arr) {
    if (arr.length <= 1) {
      return arr;
    }
  
    const pivot = arr[Math.floor(arr.length / 2)].rating;
    const left = arr.filter((element) => element.rating > pivot);
    const middle = arr.filter((element) => element.rating === pivot);
    const right = arr.filter((element) => element.rating < pivot);
  
    return [...quicksort(left), ...middle, ...quicksort(right)];
  }