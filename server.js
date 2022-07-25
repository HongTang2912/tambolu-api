const express = require('express');
const cors = require('cors');
const fs = require('fs');
const writeIntoDatabase = require('./getTicksPeople');
const Neo4jConnection = require('./Neo4jConnection')
const schedule = require('node-schedule');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors())
console.log('SERVER RUNNING.....');

function run() {


    writeIntoDatabase.getData();
}
run();
schedule.scheduleJob('0 0 2 * * *', async function(){
   
    run();
});

function sufferArray(array) {
    array.shift();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function pagination(data, skip, limit) {
    return new Promise(resolve => {
        // sufferArray(data);
        let pagination = data.slice(parseInt(skip), (parseInt(skip) + parseInt(limit)))
        resolve(pagination);
    })
}


app.get("/api/crawler/lammusic", async function(req, res) {
    const page = Math.abs(req.query.page) || 1;
    const limit = Math.abs(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // const articles = fs.readFileSync(`./TWITTER_API/trending-links/links.json`, {encoding: "utf8"});
    // const data = pagination(Neo4jConnection.read(), page, limit)
    // data.then(function (result) {

    //     res.send(result)
    // })

    Neo4jConnection.read()
    .then(function (result) {
        const data = pagination(result, page, limit)
        data.then(function (data) {

            res.send(data)
        })
    })
    
    //console.log(Neo4jConnection.read());
})

app.listen(port, console.log(`Server running on ${port}/api/crawler/lammusic`))
