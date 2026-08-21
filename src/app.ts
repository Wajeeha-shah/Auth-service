import express from "express"
const app=express();
app.get('/',(req,res)=>{
    console.log('workingg...')

})
export default app;