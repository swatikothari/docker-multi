const keys = require('./keys');

// Express app setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.unsubscribe(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded());

// Postgres Client setup
const { Pool } = require('pg')
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDataBase,
    password: keys.pgPassword,
    port: keys.pgPort
})

pgClient.on('connect', () => pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch(err => console.log(err)));

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
    res.send("Hi")
})

app.get('/values/all', async (req, res) => {
    console.log("reached server for all")
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    console.log("reached values/current")
    redisClient.hgetall('values', (err, values) => {
        console.log(values);
        res.send(values);
    })
}) 

app.post('/values', async (req, res) => {
    console.log("reached server for /values")
    console.log(req.body)
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send("Index high")
    }

    redisClient.hset('values', index, "nothing yet");
    redisPublisher.publish('insert', index)
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({working: true});
})

app.listen(5000, err => {
    console.log("listening")
})