const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const axios = require("axios")
const {randomBytes} = require("crypto")
const { stat } = require("fs")

app.use(cors())
app.use(bodyParser.json())

const commentsByPostId = {}


app.get("/posts/:id/comments", (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})
app.post("/posts/:id/comments", async (req, res) => {
    const commentId = randomBytes(4).toString("hex"); 
    const { content } = req.body; 
    const comments = commentsByPostId[req.params.id] || []; 

    comments.push({id:commentId, content, status:'pending' })
    commentsByPostId[req.params.id] = comments; 

    try{
        await axios.post('http://event-bus-srv:4005/events', {
        type:'CommentCreated', 
        data: {
            id: commentId, 
            content: content, 
            postId: req.params.id, 
            status: 'pending'

        }
    })} catch(err){
        console.log(err)
        res.status(404)
    }
    
    

    res.status(201).send(comments)

})

app.post('/events', async(req, res) => {
   
    console.log("received event", req.body.type)

    const {type, data} = req.body
    if (type === 'CommentModerated'){
        const {postId, id, status} = data
        const comments = commentsByPostId[postId]
        const comment = comments.find( comment => {return comment.id === id})
        comment.status = status; 
        try{
       
        await axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentUpdated', 
            data: {
                id, 
                content: comment.content, 
                postId, 
               status
            }
        })
    } catch(err){
        console.log(err)
        res.status(404)
    }
    
    res.send({})
   }
})

app.listen("4001", () => {
    console.log("listening on port 4001")
})