const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');
const cors = require('cors');
app.use(express.json());


//postgres refactoring --> update all route handlers when finished

const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
    user: 'petertasca',
    host: 'localhost',
    database: 'mytalksdatabase',
    password: 'randomtask',
    port: 5432
})


app.get('/talks/database', async (req, res) => {
    try {
        let result = await pool.query('SELECT * FROM talks')
        console.log("rows:", result.rows)
        res.json(result.rows)

    } catch (error) {
        console.log('Error encountered in query: ', error.stack);
        res.status(500).json({'Error encountered in query': error.stack})

    } 
})

app.post('/talks/database/comments', async (req, res) => {
    console.log("Comment Post Gres")
    try {
        let { message, author , title } = req.body;
        let comment = JSON.stringify({presenter: author, post: message});
        let text = 'UPDATE talks SET comments = array_append(comments, $1::jsonb) WHERE title = $2'
        let values = [comment, title];
        let result = await pool.query(text, values);
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Comment added successfully'})
        } else {
            res.status(404).json({error: 'Talk not found'})
        }
    } catch(error) {
        console.log("there was a problem posting to the database:", error);
        res.status(500).json({error: 'Error updating comments'})
    }
})

app.delete('/talks/database/:title', async (req, res) => {
    console.log("postgres:", req.params)
    let title = req.params.title
    console.log("postgres:", title)
    try {
        let text = 'DELETE FROM talks WHERE title = $1'
        let result = await pool.query(text, [title])
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Delete was successful'})
        } else {
            res.status(500).json({error: 'Error updating comments'})
        }

    } catch(error) {
        console.log("There's been a problem with the deletion:", error);
        res.status(500).json({error: 'Error updating comments'})
    }
})

app.put('/talks/database/addTalk', async (req, res) => {
    console.log(req.body)
    let {presenter, title, summary, comments} = req.body;
    try {
        let text = 'INSERT INTO talks (title, presenter, summary) VALUES ($1, $2, $3)'
        let values = [title, presenter, summary];
        let result = await pool.query(text, values);
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Talk was posted successfully'})
        } else {
            res.status(500).json({erro: 'Error posting talk'})
        } 
    } catch(error) {
        console.log("There's been a problem with posting the talk:", error);
        res.status(500).json({error: "Error posting talk"})
    }
})




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

app.talks = {};





 async function talkData() {
    const data = await fs.promises.readFile('talks.json', 'utf8');
    return data
 }

 async function loadTalkData() {
    const data = await talkData()
    if (app.version == 0 && /\S/.test(data)) {
        console.log("preparse test:", data)
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
        status: 200,
        headers: {"Content-Type": "application/json",
                  "ETag": `"${app.version}"`,
                  "Cache-Control": "no-store"}
    }

}




//Ask John about app.waiting
app.update = async function() {
    console.log("app update cehck")
    app.version++
    let response = talkResponse();
        let toWrite = JSON.stringify(app.talks)
        console.log("to write:", toWrite)

        fs.writeFile('talks.json', toWrite, (err) => {
            if (err) console.log(`Error: ${err}`)
            else console.log("Success!")
        })

    console.log("app update, app.waiting:", app.waiting)

    app.waiting.forEach(resolveFunction => {
        console.log("resolve in waiting for each:", resolveFunction)
        console.log("waiting for each response:", response);
        // const result = {
        //     status: 200,
        //     ...response
        // }
        // console.log("waiting for changes test result:", result)



        resolveFunction(response)
    });
    app.waiting = []
}

app.waitForChanges = function(time) {
    console.log(`waiting for changes for ${time} seconds`)
    return new Promise((resolve => {
        app.waiting.push(resolve);
        setTimeout(() => {
            console.log(`timeout completed`)
            console.log("app waiting:", app.waiting)
            if (!app.waiting.includes(resolve)) return;
            app.waiting = app.waiting.filter(r => r != resolve);
            const result = {status: 304};
            console.log("resolving with:", result)
            resolve(result)    
        }, time * 1000)
    }))
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

app.get('/talks/longpoll', async (req, res) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    if (!tag || tag[1] != app.version) {
        let { body, headers } = talkResponse();
        console.log(`No tag -- sending ${body}`)
        res.set(headers)
        res.send(body)
    } else if (!wait) {
        res.send({status: 304});
    } else {
       try {
        let { status, body, headers }  = await app.waitForChanges(Number(wait[1]));
        console.log("long polling status:", status)
        if (typeof status !== 'number' || status < 100 || status >= 600) {
         throw new Error(`Invalid status code received: ${status}`)
        }
        res.set(headers);

        res.status(status).send(body)

       }
       catch (error) {
        console.log("Error in longpolling", error.message);
        res.status(500).json({error: "Internal Server Error"})
    } 
    } 
});

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
        console.log("app update check again")
        return {status: 204}

    } catch (err) {
        console.log(`Apologies, but there's been an problem ${err}`)
    }
    
});



 app.delete('/talks/:title', async (req, res, next) => {

    console.log("delete request:", req.body)
    console.log("delete request params:", req.params)
    let {title} = req.params
    console.log("deleted title:", title)
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







initializeApp().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })

})



