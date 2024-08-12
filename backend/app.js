const express = require('express');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');

app.version = 0;
app.talks = [];
app.waiting = [];

const cors = require('cors');

app.updated = function() {
    app.version++;
    app.waiting.forEach(resolve => resolve(response));
    app.waiting = []
}



app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5173/talks', 'http://localhost:5173/talks/longpoll'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: 'Content-Type'
}));

app.use(express.json())
// app.use(express.text())
// app.use(express.static(path.join(__dirname, '../frontend/dist')));



 async function talkData() {
    const data = await fs.promises.readFile('talks.json', 'utf8');
    console.log("talks JSON data:", data)
    return data
 }

 


async function talkResponse() {
    let storedTalks = await talkData();
    console.log("stored talks:", storedTalks);
    let talkResponse = {
        body: storedTalks,
        headers: {"Content-Type": "application/json",
                  "ETag": `"${app.version}"`,
                  "Cache-Control": "no-store"}
    }
    console.log("talk response:", talkResponse);
    return talkResponse
 
}




app.get('/talks', async (req, res, next) => {
    try {
        const data = await talkResponse();
        console.log("get response talk data with headers:", data)
        res.send(data)
    } catch (err) {
        console.log(`An unexpected error occurred: ${err}`)
    }
    next()
})


app.put('/talks', async (req, res, next) => {
    console.log("request body:", req.body)
    app.talks.push(req.body);
    try {
        const data = JSON.parse(await talkData());
        data.push(req.body);
        const toWrite = JSON.stringify(data);
        fs.writeFile('talks.json', toWrite, (err) => {
            if (err) console.log(`Error: ${err}`)
            else console.log("Success!")
        })
        app.updated()

    } catch (err) {
        console.log(`Apologies, but there's been an problem ${err}`)
    }
    next()
})

app.get('/talks/longpoll', async (req, res, next) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    console.log("Long poll tag and wait:", tag, wait)
    if (!tag || tag[1] != app.version) {
        let response = await talkResponse();
        res.send(response)
    } else if (!wait) {
        res.send({status: 304});
    } else {
        return app.waitForChanges(Number(wait[1]));
    }
    next()
});

app.waitForChanges = function(time) {
    return new Promise(resolve => {
        app.waiting.push(resolve);
        setTimeout(() => {
            if (!app.waiting.includes(resolve)) return;
            app.waiting = app.waiting.filter(r => r != resolve);
            resolve({status: 304})
        }, time * 1000)
    })
}


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

