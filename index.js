const express = require('express');
const cors = require('cors');
const mongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');

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

    // READ section of CRUD
    app.get('/reviews', async function(req,res){
        // console.log("req.query=", req.query);
        // This section is for search engine
        let criteria = {};
        if (req.query.title) {
            criteria.title = {
                '$regex': req.query.title,
                '$options': 'i'
            }
        }

        if (req.query.min_rating) {
            criteria.rating = {
                '$gte': parseInt(req.query.min_rating)
            }
        }
        console.log("criteria=", criteria);
        const reviews = await db.collection('reviews').find(criteria).toArray();
        res.json(reviews);
    })

    // CREATE section of CRUD
    app.post('/reviews', async function(req,res) {
        await db.collection('reviews').insertOne({
            "title": req.body.title,
            "food": req.body.food,
            "content": req.body.content,
            "rating": req.body.rating
        })
        res.json({
            'message': 'ok'
        })
    })

    // UPDATE section of CRUD
    app.put('/reviews/:reviewId', async function(req,res) {
        const review = await db.collection('reviews').findOne({
            '_id':ObjectId(req.params.reviewId)
        })
        
        await db.collection('reviews').updateOne({
            '_id': ObjectId(req.params.reviewId)
        },{
            '$set': {
                'title': req.body.title ? req.body.title : review.title,
                'food': req.body.food ? req.body.food : review.food,
                'content': req.body.content ? req.body.content : review.content,
                'rating': req.body.rating ? req.body.rating : review.rating
            }
        })
        res.json ({
            'message': 'put received'
        })
    })
}

main();

app.listen(3000, function() {
    console.log('server has started')
})