const express = require('express');
const morgan = require('morgan');
const app = express();

const port = 3000;
const cors = require('cors');
app.use(express.json());
app.version = 0;
app.waiting = [];

app.use(cors({
    exposedHeaders: "ETag"
}));

app.use(morgan("dev"));
async function initializeApp() {
    console.log('Initializing app')
 }

//SERVE STATIC IMPLEMENTATION
// const path = require("path");
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
    user: 'petertasca',
    host: 'localhost',
    database: 'mytalksdatabase',
    password: 'randomtask',
    port: 5432
})


app.post('/talks/database/comments', async (req, res) => {

    try {
        let { message, author , title } = req.body;
        // let comment = JSON.stringify({presenter: author, post: message});
        // let text = 'UPDATE talks SET comments = array_append(comments, $1::jsonb) WHERE talktitle = $2'
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

app.delete('/talks/database/:title', async (req, res) => {
    let title = req.params.title;
    try {
        let text = 'DELETE FROM talks WHERE title = $1'
        let result = await pool.query(text, [title])
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Delete was successful'})
        } else {
            res.status(500).json({error: 'Error updating comments'})
        }
        app.update()
    } catch(error) {
        console.log("There's been a problem with the deletion:", error);
        res.status(500).json({error: 'Error updating comments'})
    }
})

app.put('/talks/database/addTalk', async (req, res) => {
    let {presenter, title, summary, comments} = req.body;
    try {
        let text = 'INSERT INTO talks (title, presenter, summary) VALUES ($1, $2, $3)'
        let values = [title, presenter, summary];
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

// , array_agg(comments) AS talks.comments
//     FROM talks
//     INNER JOIN comments ON talks.title = comments.talktitle
async function talkResponse() {
    const query = `SELECT talks.title, talks.presenter, talks.summary,
    array_agg(
        json_build_object(
            'message', comments.message,
            'presenter', comments.presenter
        )
    ) AS comments
    FROM talks
    LEFT JOIN comments ON talks.title = comments.talktitle
    GROUP BY talks.title, talks.presenter, talks.summary;`
    console.log("query:", query)
    let result = await pool.query(query)
    // console.log("test comments response:", result)
    let data = JSON.stringify(result.rows)
    console.log("talk response data:", data)
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


// async function talkResponse() {
//     let result = await pool.query('SELECT * FROM talks');
//     // console.log("post gres talk response check:", result)
//     let data = JSON.stringify(result.rows)
//     // console.log("post gres JSON data:", data)
//     return {
//         body: data,
//         status: 200,
//         headers: {
//             'Content-Type': 'application/json',
//             "ETag": `"${app.version}"`,
//             'Cache-Control': 'no-store'
//         }
//     }
// }

app.get('/talks', async (req, res, next) => {
    try {
        // let commentData = await testCommentsResponse();
        // console.log("comment data:", commentData)
        let data = await talkResponse()
        console.log("get data talk response:", data)
        res.send(data)
    } catch(error) {
        console.log('There was an error fetching the talks:', error.stack)
    }
})


//Ask John about app.waiting
app.update = async function() {
    console.log("app update cehck")
    app.version++
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
            // console.log(`timeout completed`)
            // console.log("app waiting:", app.waiting)
            if (!app.waiting.includes(resolve)) return;
            app.waiting = app.waiting.filter(r => r != resolve);
            const result = {status: 304};
            // console.log("resolving with:", result)
            resolve(result)    
        }, time * 1000)
    }))
}




app.get('/talks/longpoll', async (req, res) => {
    let tag = /"(.*)"/.exec(req.headers["if-none-match"]);
    let wait = /\bwait=(\d+)/.exec(req.headers["prefer"]);
    if (!tag || tag[1] != app.version) {





        let { body, headers } = await talkResponse();

        console.log("long poll headers:", headers)
        console.log("long poll body:", body)
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





initializeApp().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })

})



