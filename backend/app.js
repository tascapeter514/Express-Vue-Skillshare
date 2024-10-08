const express = require('express');
const app = express();
const port = 3000;



const morgan = require('morgan');
const cors = require('cors');


app.version = 0;
app.waiting = [];

app.use(express.json());
app.use(cors({
    exposedHeaders: "ETag"
}));

app.use(morgan("dev"));

async function initializeApp() {
    console.log('Initializing app')
 }

//SERVE STATIC
// const path = require("path");
// app.use(express.static(path.join(__dirname, '../frontend/dist')));


//POSTGRESQL CONNECTION
const pg = require('pg');
const { Pool } = pg;
const pool = new Pool({
    user: 'petertasca',
    host: 'localhost',
    database: 'mytalksdatabase',
    password: 'randomtask',
    port: 5432
})


//CRUD ROUTE HANDLERS
app.put('/talks/addTalk', async (req, res) => {
    let {presenter, title, summary, timeStamp} = req.body;
    try {
        let text = 'INSERT INTO talks (title, presenter, summary, timestamp) VALUES ($1, $2, $3, $4)'
        let values = [title, presenter, summary, timeStamp];
        let result = await pool.query(text, values);
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Talk was posted successfully'})
        } else {
            res.status(500).json({error: 'Error posting talk'})
        }
        app.update() 
    } catch(error) {
        console.log("There's been a problem with posting the talk:", error);
        res.status(500).json({error: "Error posting talk"})
    }
})


app.delete('/talks/:title', async (req, res) => {
    let title = req.params.title;
    try {
        let talkTableText = 'DELETE FROM talks WHERE title = $1'
        let talkTableResult = await pool.query(talkTableText, [title])
        let commentTableText = 'DELETE from comments WHERE talktitle = $1'
        let commentTableResult = await pool.query(commentTableText, [title])
        if (talkTableResult.rowCount > 0 && commentTableResult.rowCount > 0) {
            res.status(200).json({message: 'Your talk and all associated comments have been deleted'})
        } else {
            res.status(500).json({error: 'Error deleting talk and all associated comments'})
        }
        app.update()

    } catch (error) {
        console.log("There's been a problem with deleting your talk and all its associated comments")

    }
})

app.post('/talks/comments', async (req, res) => {
    try {
        let { message, author , title } = req.body;
        let text = 'INSERT INTO comments (talktitle, message, presenter) VALUES ($1, $2, $3)'
        let values = [title, message, author];
        let result = await pool.query(text, values);
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Comment added successfully'})
        } else {
            res.status(404).json({error: 'Talk not found'})
        }
        app.update()
    } catch(error) {
        console.log("there was a problem posting to the database:", error);
        res.status(500).json({error: 'Error updating comments'})
    }
})



//LONG POLLING
async function talkResponse() {
    const query = `SELECT talks.title, talks.presenter, talks.summary, talks.timestamp,
    COALESCE(
    jsonb_agg(
        CASE
        WHEN comments.presenter IS NOT NULL THEN
        json_build_object(
            'message', comments.message,
            'presenter', comments.presenter
        )
        END
    ) FILTER (WHERE comments.message IS NOT NULL),
        '[]'::jsonb
    ) AS comments
    FROM talks
    LEFT JOIN comments ON talks.title = comments.talktitle
    GROUP BY talks.title, talks.presenter, talks.summary, talks.timestamp
    ORDER BY title;`
    let result = await pool.query(query)
    let data = JSON.stringify(result.rows)
    return {
        body: data,
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'ETag': `"${app.version}"`,
            'Cache-Control': 'no-store'
        }
    }
}


app.update = async function() {
    app.version++;
    let response = await talkResponse();
    app.waiting.forEach(resolveFunction => {
        resolveFunction(response)
    });
    app.waiting = []
}

app.waitForChanges = function(time) {
    console.log(`waiting for changes for ${time} seconds`)
    return new Promise((resolve => {
        app.waiting.push(resolve);
        setTimeout(() => {
            if (!app.waiting.includes(resolve)) return;
            app.waiting = app.waiting.filter(r => r != resolve);
            const result = {status: 304};
            resolve(result)    
        }, time * 1000)
    }))
}

app.get('/talks/longpoll', async (req, res) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    if (!tag || tag[1] != app.version) {
        let { body, headers } = await talkResponse();
        console.log(`No tag -- sending ${body}`)
        res.set(headers)
        res.send(body)
    } else if (!wait) {
        res.send({status: 304});
    } else {
       try {
        let { status, body, headers }  = await app.waitForChanges(Number(wait[1]));
        if (typeof status !== 'number' || status < 100 || status >= 600) {
         throw new Error(`Invalid status code received: ${status}`)
        }
        res.set(headers);
        res.status(status).send(body)

       }
       catch (error) {
        console.log("Error in long polling", error.message);
        res.status(500).json({error: "Internal Server Error"})
    } 
    } 
});


initializeApp().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })

})
