const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;
const fs = require('fs');
const cors = require('cors');
app.use(express.json())
const pg = require('pg');

app.version = 0;
app.waiting = [];
app.talks = {};

app.use(cors({
    exposedHeaders: "ETag"
}))

const { Pool } = pg;

const pool = new Pool({
    user: 'petertasca',
    host: 'localhost',
    database: 'mytalksdatabase',
    password: 'ranodmtask',
    port: 5432
})

async function pgsqlData() {
    try {
        let result = await pool.query('SELECT * FROM talks')
        let data = res.json(result.rows);
        return data
    } catch(error) {
        console.log('There was an error fetching the talks from the database:', error)
        res.status(505).json({error: 'There was an error with getting the talks from the database'})
    }
}

async function loadPGSQLData() {
    const data = await pgsqlData();
    if (app.version == 0 && /\S/.test(data)) {
        console.log("heres the postgress data:", data)
    }

}

pgsqlData()
loadPGSQLData()

app.get('/talks/database', async (req, res) => {
    try {
        let result = await pool.query('SELECT * FROM talks')
        res.json(result.rows)
    } catch(error) {
        console.log("Error encountered in query:", error.stack)
        res.status(500),json({'Error encountered in query': error.stack})
    }
})

app.post('/talks/database/comments', async (req, res) => {
    try {
        let { message, author, title } = req.body;
        let comment = JSON.stringify({presenter: author, post: message});
        let text = 'UPDATE talks SET comments = array_append(comment, $1::jsonb) WHERE title = $2'
        let values = [comment, title];
        let result = await pool.query(text, values);
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Comment added successfully'})
        } else {
            res.status(404).json({error: 'Talk not found'})

        }
    } catch(error) {
        console.log("There was problem posting to the database:", error);
        res.status(500).json({error: 'Error updating comments'})

    }
})

app.delete('/talks/database/:title', async (req, res) => {
    let title = req.params.title;
    try {
        let text = 'DELETE FROM talks WHERE title = $1'
        let result = await pool.query(text, [title]);
        if (res.rowCount > 0) {
            res.status(200).json({message: 'Delete was successful'})
        } else {
            res.status(500).json({error: 'Error deleting talk'})
        }
    } catch(error) {
        console.log("There's been a problem with the deletion:", error);
        res.status(500).json({error: 'Error updating comments'})
    }
})

app.put('/talks/database/addTalk', async (req, res) => {
    let {presenter, title, summary } = req.body;
    try{ 
        let text = 'INSERT INTO talks (title, presenter, summary) VALUES ($1, $2, $3)'
        let values = [title, presenter, summary]
        let result = await pool.query(text, values)
        if (result.rowCount > 0) {
            res.status(200).json({message: 'Talk was posted successfully'})
        } else {
            res.status(500).join({error: 'Error posting talk'})
        }
    } catch(error) {
        console.log("there was a problem with posting the talk:", error)
        res.status(500).json({error: 'Error posting talk'})
    }
})

initializeApp().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on htttp://localhost:${port}`)
    })
})