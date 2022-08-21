const express=require("express");
const path=require("path");
const sqlite3=require("sqlite3");
const {open}=require("sqlite");
const bcrypt=require("bcrypt")

const app=express();

app.use(express.json());

const db_path=path.join(__dirname,"userData.db");

let db=null;

const initialize=async()=>{
try{
db=await open({
filename:db_path,
driver:sqlite3.Database,
})
app.listen(3000,()=>
console.log("Server Running at http://localhost:3000/");

)
}catch(e){
console.log(`DB Error :${e.message}`);
process.exit(1);
}
}

initialize();



const passwordCheck=(password)=>{
return password.length>4
}

app.post("/register",async(request,respond)=>{
const {username,name,password,gender,location}=request.body;
const hashPassword=await bcrypt.hash(password,10);
const select_query=`
SELECT
*
FROM
user
WHERE
username='${username}';`;

const dbUser=await db.get(select_query);

if (dbUser === undefined){
const new_query=`
INSERT IN TO user (username,name,password,gender,location)
VALUES ('${username}','${name}','${hashPassword}','${gender}','${location}');`;
if (passwordCheck(password)){
await db.run(new_query)
response.send("User created successfully");

}else{
response.status(400)
response.send("Password is too short");
}
}else{
response.status(400)
response.send("User already exists");

}
});



app.post("/login",async(request,response)=>{
const {username,password}=request.body;
const select_query=`
SELECT
*
FROM
user
WHERE
username='${username}';`;


const dbDetails=await db.get(select_query);

if (dbDetails === undefined){
response.status(400);
response.send("Invalid user")
}else{
const passwordMatch=await bcrypt.compare(password,dbDetails.password);
if(passwordMatch===true){
response.status(200);
response.send("Login success!");

}else{
response.status(400);
response.send("Invalid password");
}

}
})

app.put("/change-password",async(request,response)=>{
const {username,oldPassword,newPassword}=request.body;
const sel_query=`
SELECT
*
FROM
user
WHERE
username='${username}';`;

const details=await db.get(sel_query);
if (details===undefined){
response.status(400);
response.send("Invalid user")
}else{
const hashedPassword=await bcrypt.compare(oldPassword,details.password);
if (hashedPassword === true){
if (passwordCheck(newPassword)){
const new_password=await bcrypt.hash(newPassword,10);
const query=`
UPDATE
user
SET
password='${new_password}'
WHERE
username='${username}';`;

await db.run(query);
response.send("Password updated")

}else{
response.status(400);
response.send("Password is too short");
}
}else {
response.status(400);
response.send("Invalid current password");
}

}
});

module.exports=app;
