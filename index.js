import express, { urlencoded } from "express"
import path from "path"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import bcrypt from "bcrypt"


mongoose.connect("mongodb://localhost:27017/Practice").then(()=>console.log("database is connected")).catch((e)=>{})

const schem =new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const mod= mongoose.model("pract",schem)

const app = express()


app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.set("view engine" ,"ejs")

const isAuthenticated=async(req ,res,next)=>{

    const {token}=req.cookies
    

    if(token){
       const decode = jwt.verify(token,"randomsecret")
       req.user =await mod.findById(decode._id)
        next()
    }
    else{
        res.redirect("/login")
    }

}

app.get("/",isAuthenticated,(req,res)=>{
    // const {token} =req.cookies
    // // const token =req.cookies.token

    // if(token){
    //     res.render("logout")
    // }
    
    // else{
    //     res.render("login")
    // }
    // console.log(req.user)
    res.render("logout" ,{name:req.user.name})
})

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get("/register" ,(req,res)=>{
    res.render("Register")
})


app.post("/register",async(req,res)=>{
    const {name , email , password} =req.body
    // console.log(req.body.name)

    let user = await mod.findOne({email})

    if(user){
       return res.redirect("/login")
    }

    const hashedpassword = await bcrypt.hash(password,10)

    user =await mod.create({
        name,
        email,
        password : hashedpassword,
    })

    const token = jwt.sign({_id:user._id},"randomsecret")
    

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
        


    })
    res.redirect("/")
})


app.get("/logout",(req,res)=>{
res.cookie("token",null,{
    httpOnly:true,
    expires:new Date(Date.now())
})

    res.redirect("/")
})


// app.post("/login",async(req,res)=>{

//     await mod.create({name:req.body.name,email:req.body.email})

//     res.redirect("/logout")


// })

app.post ("/login",async(req,res)=>{
    // console.log(req.body)

    const {email,password} =req.body

    let user = await mod.findOne({email})

    if(!user){
       return res.redirect("/register")
    }


    const isMatch = await bcrypt.compare(password , user.password)
    // const isMatch = user.password===password
    if(!isMatch) return  res.render('/login',{meassage :"Incorrect Password"})


    // user= await mod.create({
    //     name ,
    //     email,
    // })

    //jwt
    const token = jwt.sign({_id:user._id},"randomsecret")
    

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
        


    })
    res.redirect("/")
})





app.listen(8000,(req,res)=>{
    console.log("server is listning on port 8000")
})