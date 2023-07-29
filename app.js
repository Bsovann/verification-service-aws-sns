require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));

/*
    RESTFUL BOOKAPI

    1. GET (Retrive) - All books or Single book based on ID. 
    2. POST (Create) - Add a book to Book Collection. 
    3. PUT (Replace) - Repace a single book based on ID. 
    4. PATCH (Modify) - Modify a single book based on ID.
    5. DELETE (Delete) - Delete a single book based on ID or an entire collection.
 
*/

// Connect to mongodb using mongoose
main().catch(err => console.error(err));
async function main() {
    await mongoose.connect('mongodb+srv://bondithsovann:Bos$40160@cluster0.btzxn0s.mongodb.net/Messages');
}
// Define Schema 
const schema = new mongoose.Schema({
    msgid: String,
    title: String,
    number: String,
    message: String
});

const Message = new mongoose.model("Message", schema);


app.get('/', (req, res) => {

});

// Add Single Message
app.route('/messages')
    .post(async function (req, res) {
        const newMessage = new Message({
            msgid: req.body.msgid,
            title: req.body.title,
            number: req.body.number,
            message: req.body.message
        });
        Message.insertMany([newMessage]);
        console.log("Successfully Added");
        res.send("Successfully Sent! We have received!!");
    });


app.listen(3000, function () {
    console.log('listening on port 3000');
})