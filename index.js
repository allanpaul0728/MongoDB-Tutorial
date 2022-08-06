const express = require('express');
const cors = require('cors');
const mongoUtil = require('./MongoUtil');

const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://allanpaul0728:0728CarBon@cluster0.2cu2q.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "sample_reviews";

async function main() {
    const db = await mongoUtil.connect(MONGO_URI, DB_NAME);
    

    app.get('/', function(req,res) {
        res.json({
            'message':'I love cupcakes and candies'
        })
    })

    app.post('/reviews', async function(req,res) {
        await db.collection('reviews').insertOne({
            "title":"Good steak at the SteakOut Restaurant",
            "food": "Ribeye Steak",
            "content": "The steak was perfectly prepared",
            "rating": 9
        })
        res.json({
            'message': 'ok'
        })
    })
}

main();

app.listen(3000, function() {
    console.log('server has started')
})