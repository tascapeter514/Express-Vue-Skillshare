const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');
const cors = require('cors');

app.use(morgan("dev"));

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
    exposedHeaders: "ETag"
}));
app.use(express.json())



app.talks = {}



 async function talkData() {
    const data = await fs.promises.readFile('talks.json', 'utf8');
    return data
 }

 async function loadTalkData() {
    const data = await talkData()
    if (app.version == 0 && /\S/.test(data)) {
        let parsedData = JSON.parse(data)
        app.talks = parsedData
    }
 }

 async function initializeApp() {
    console.log('Initializing app')
    await loadTalkData()
    console.log(`app.talks = ${JSON.stringify(app.talks)}`)
 }


// app.use(express.static(path.join(__dirname, '../frontend/dist')));



function talkResponse() {
    let talks = Object.keys(app.talks).map(title => app.talks[title])
    let response = JSON.stringify(talks)
    return {
        body: response,
        headers: {"Content-Type": "application/json",
                  "ETag": `"${app.version}"`,
                  "Cache-Control": "no-store"}
    }

}

app.get('/talks', async (req, res, next) => {
    try {
        const data = talkResponse();
        res.send(data)
    } catch (err) {
        console.log(`An unexpected error occurred: ${err}`)
    }
    next()
})
//JSM => app.update is called after PUT but is routed to wait for changes function
//JSM => problem may have to do with the forEach method not resolving responses?
app.update = async function() {
    console.log("app update cehck")
    app.version++
    // let response = talkResponse();
        let toWrite = JSON.stringify(app.talks)
        console.log("to write:", toWrite)

        fs.writeFile('talks.json', toWrite, (err) => {
            if (err) console.log(`Error: ${err}`)
            else console.log("Success!")
        })

    console.log("app update, app.waiting:", app.waiting)

    app.waiting.forEach((resolve, response) => resolve(response));
    app.waiting = []
}
app.put('/talks/', async (req, res, next) => {
    console.log('put request start')
    try {
        app.talks[req.body.title] = {
            title: req.body.title,
            summary: req.body.summary,
            presenter: req.body.presenter,
            comments: req.body.comments,
            toggleTalk: req.body.toggleTalk

        }
        console.log("app udpate check")
        app.update();
        return {status: 204}

    } catch (err) {
        console.log(`Apologies, but there's been an problem ${err}`)
    }
    
});



//long polling technique
//JSM => PUT requests are getting routed to the third condition and returning undefined status and headers
//the third condition returns a normal status with the timeout, but whenever a PUSH request is made these return undefined
app.get('/talks/longpoll', async (req, res) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    console.log("tag:", tag)
    console.log("app version:", app.version)
    if (!tag || tag[1] != app.version) {
        let { body, headers } = talkResponse();
        console.log(`No tag -- sending ${body}`)
        res.set(headers)
        res.send(body)
    } else if (!wait) {
        res.send({status: 304});
    } else {
       const { body, status, headers } = await app.waitForChanges(Number(wait[1]));
       console.log("long polling status:", status)
       console.log("long polling status and headers:", body, headers)
       res.set(headers);
       res.status(status)
       res.send(body)
    }
});

app.delete('/talks/:title', async (req, res, next) => {
    let {title} = req.params
    if (Object.hasOwn(app.talks, title)) {
        delete app.talks[title];
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
        app.update();
        return {status: 204}
    }


    next()
})

app.waitForChanges = function(time) {
    console.log(`waiting for changes for ${time} seconds`)
    return new Promise(resolve => {
        app.waiting.push(resolve);
        setTimeout(() => {
            console.log(`timeout completed`)
            console.log("app waiting:", app.waiting)
            if (!app.waiting.includes(resolve)) return;
            app.waiting = app.waiting.filter(r => r != resolve);
            resolve({
                status: 304,
                body: 'No Changes',
                headers: {'Content-Type': 'application/json'}
            })
        }, time * 1000)
    })
}


//JSM ==> simpler version of waitforchanges without resolving functions in app.waiting works fine after page reload
//JSM ==> problem is that PUT keeps getting routed to waitForChanges and returning an undefined status message


// app.waitForChanges = function(time) {
//     console.log("wait for changes check")
//     console.log("app waiting:", app.waiting)
//     return new Promise(resolve => {
        
//         console.log("before push, app.waiting:", app.waiting)
//         app.waiting.push(resolve)
//         console.log("after push, app.waiting:", app.waiting)
//         setTimeout(() => {
//             console.log("time out check")
//             resolve({
//                 status: 304,
//                 body: 'No Changes',
//                 headers: { 'Content-Type': 'application/json' }
//             });
//         }, time * 1000);
//     });
// };


initializeApp().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })

})



