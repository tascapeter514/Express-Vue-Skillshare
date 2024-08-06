const express = require('express');
const app = express();
const path = require("path");
const port = 3000;



app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/message', (req, res) => {
    res.send("Connected to Pete's Skillshare")
})


app.listen(port, () => {
    console.log(`Listening on ${port}`)
})

