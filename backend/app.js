const express = require('express');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');

const cors = require('cors');

const talks = [];

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
    console.log("talks JSON data:", data)
    return data
 }




app.get('/talk', async (req, res, next) => {
    try {
        const data = await talkData();
        res.send(JSON.stringify(data))
    } catch (err) {
        console.log(`An unexpected error occurred: ${err}`)
    }
    next()
})



app.put('/talk', async (req, res, next) => {
    talks.push(req.body);
    try {
        const data = JSON.parse(await talkData());
        data.push(req.body);
        const toWrite = JSON.stringify(data);
        fs.writeFile('talks.json', toWrite, (err) => {
            if (err) console.log(`Error: ${err}`)
            else console.log("Success!")
        })

    } catch (err) {
        console.log(`Apologies, but there's been an problem ${err}`)
    }
    next()
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

