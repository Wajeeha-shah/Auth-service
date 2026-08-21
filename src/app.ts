import express from "express"
import logger from "./utils/logger";

const app=express();
app.get('/',(req,res)=>{
    logger.info('GET / hit');
    res.status(200).send('workingg...')

})
app.use((err,req,res,next)=>{
    
})
export default app;
