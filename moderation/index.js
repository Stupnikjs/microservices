const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")

const app = express()
app.use(bodyParser.json())


app.post('/events', async (req,res ) => {

const {type, data} = req.body

if (type === 'CommentCreated' ){
    const status = data.content.includes('orange') ? 'rejected' : 'approved'; 
    try{
        await axios.post('http://event-bus-srv:4005/events', {
            type:'CommentModerated', 
            data: {
                id: data.id, 
                postId: data.postId, 
                status, 
                content: data.content
            }
        })
        res.send({})

    } catch(err){
        console.log(err.message)
        res.status(404)
        
    }
}

})

app.listen(4003, () => {
    console.log("listening on 4003")
})