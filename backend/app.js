const express = require('express');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');
const cors = require('cors');

// const testArray = [{peter: false}];
// const stringify = JSON.stringify(testArray)
// console.log("stringify:", stringify)
// fs.writeFile('testTalks.json', stringify, (err) => {
//     if (err) console.log(`Error: ${err}`)
//     else console.log("Success!")
// })
// let readStringify = fs.readFile('testTalks.json', 'utf8', (err) => {
//     if (err) console.log(`Error ${err}`)
//     else console.log('sucess!')
// })
// console.log("parsed:", readStringify)


app.version = 0;
app.waiting = [];

app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5173/talks', 'http://localhost:5173/talks/longpoll'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'],
    allowedHeaders: 'Content-Type'
}));
app.use(express.json())


let incomingData = false;
app.talks = {}



 async function testTalkData() {
    const data = await fs.promises.readFile('talks.json', 'utf8');
    return data
 }

 async function loadTalkData() {
    const data = await testTalkData()
    if (app.version == 0 && /\S/.test(data)) {
        let parsedData = JSON.parse(data)
        app.talks = parsedData
    }
 }

 async function initializeApp() {
    await loadTalkData()
 }

 if (app.version == 0) {
    initializeApp()
 }

// app.use(express.static(path.join(__dirname, '../frontend/dist')));



function startTalksResponse() {
    let talks = Object.keys(app.talks).map(title => app.talks[title])
    let response = JSON.stringify(talks)
    return {
        body: response,
        headers: {"Content-Type": "application/json",
                  "ETag": `"${app.version}`,
                  "Cache-Control": "no-store"}
    }

}

app.get('/talks', async (req, res, next) => {
    try {
        const data = startTalksResponse();
        res.send(data)
    } catch (err) {
        console.log(`An unexpected error occurred: ${err}`)
    }
    next()
})

app.update = async function() {
    app.version++
    if (incomingData) {
        let toWrite = JSON.stringify(app.talks)
        fs.writeFile('talks.json', toWrite, (err) => {
            if (err) console.log(`Error: ${err}`)
            else console.log("Success!")
        })
        incomingData = false;

    }

    app.waiting.forEach(resolve => resolve(response));
    app.waiting = []
}
app.put('/talks/', async (req, res, next) => {
    try {
        app.talks[req.body.title] = {
            title: req.body.title,
            summary: req.body.summary,
            presenter: req.body.presenter,
            comments: req.body.comments,
            toggleTalk: req.body.toggleTalk

        }
        incomingData = true
        app.update();
        return {status: 204}

    } catch (err) {
        console.log(`Apologies, but there's been an problem ${err}`)
    }
    next()
    return {status: 204};
    
});



//long polling technique
app.get('/talks/longpoll', async (req, res, next) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    if (!tag || tag[1] != app.version) {
        let response = startTalksResponse();
        res.send(response)
    } else if (!wait) {
        res.send({status: 304});
    } else {
        return app.waitForChanges(Number(wait[1]));
    }
    next()
});

app.delete('/talks/:title', async (req, res, next) => {
    let {title} = req.body
    if (Object.hasOwn(app.talks, title)) {
        delete app.talks[title];
        incomingData = true;
        app.update();
    }
    return {status: 204}
    next()

})

app.post('/talks/comments', async (req, res, next) => {
    let {message, presenter, title} = req.body
    let comment = {author: presenter, post: message};
    console.log("comment:", comment)
    if (Object.hasOwn(app.talks, title)) {
        app.talks[title].comments.push(comment)
        console.log("talk comments in server:", app.talks[title])
        incomingData = true;
        app.update();
        return {status: 204}
    }


    next()
})

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

