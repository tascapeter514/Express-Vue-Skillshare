const express = require('express');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');

const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: 'Content-Type'
}));

app.use(express.json())
// app.use(express.text())
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

let message = "Hello there!"

 async function talkData() {
    const data = await fs.promises.readFile('talks.json', 'utf8');
    return JSON.stringify(data)
 }




app.get('/talk', async (req, res, next) => {
    try {
        const data = await talkData();
        res.send(data)
    } catch (err) {
        console.log(`An unexpected error occurred: ${err}`)
    }
    next()
})

app.put('/talk', (req, res, next) => {
    console.log("method:", req.method)
    console.log("URL:", req.url)
    console.log("body", req.body)
    fs.appendFile('talks.json', JSON.stringify(req.body) + '\n', (err) => {
        if (err) console.log(`We're sorry, but there's been a problem with writing the file: ${err}`)
        else console.log(`Success! The following request body has been written to file: ${JSON.stringify(req.body)}`)
    })
    next()
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

