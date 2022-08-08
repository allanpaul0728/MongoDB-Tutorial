const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');

const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

async function main() {
    const db = await mongoUtil.connect(MONGO_URI, DB_NAME);
    

    app.get('/', function(req,res) {
        res.json({
            'message':'Yes, its working'
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
        const reviews = await db.collection('reviews').find(criteria, {
            'projection': {
                '_id': 1,
                'food': 1,
                'title': 1,
                'content': 1,
                'rating': 1
            }
        }).toArray();
        res.json(reviews);
    })

    // CREATE section of CRUD
    app.post('/reviews', async function(req,res) {
        const result = await db.collection('reviews').insertOne({
            "title": req.body.title,
            "food": req.body.food,
            "content": req.body.content,
            "rating": req.body.rating
        })
        res.json({
            'message': 'successfully created',
            'result': result
        })
    })

    // UPDATE section of CRUD
    app.put('/reviews/:reviewId', async function(req,res) {
        const review = await db.collection('reviews').findOne({
            '_id':ObjectId(req.params.reviewId)
        })
        
        const result = await db.collection('reviews').updateOne({
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
            'message': 'successfully updated',
            'result': result
        })
    })

    // DELETE section of CRUD
    app.delete('/reviews/:reviewId', async function(req, res) {
        await db.collection('reviews').deleteOne({
            '_id': ObjectId(req.params.reviewId)
        })
        res.json ({
            'message':'successfully deleted'
        })
    })

    // This section is to add embedded document on a certain Object Id
    app.post('/reviews/:reviewId/comments', async function(req, res) {
        const result = await db.collection('reviews').updateOne({
            '_id': ObjectId(req.params.reviewId)
        }, {
            '$push': {
                'comments':{
                    '_id': ObjectId(),
                    'content': req.body.content,
                    'nickname': req.body.nickname
                }
            }
        })
        res.json({
            'message':'successfully added document',
            'result': result
        })
    })
    // This section is to get the information including the sub-documents
    app.get('/reviews/:reviewId', async function(req,res) {
        const review = await db.collection('reviews').findOne({
            '_id':ObjectId(req.params.reviewId)
        })
        res.json(review);
    })

    // This section is to update the added comment on a certain Object Id
    app.put('/comments/:commentId', async function(req, res) {
        const result = await db.collection('reviews').updateOne({
            'comments._id':ObjectId(req.params.commentId)
        },{
            '$set': {
                'comments.$.content': req.body.content,
                'comments.$.nickname': req.body.nickname
            }
        })
        res.json({
            'message':'successfully updated the embedded comment',
            'result': result
        })
    })

    // This section is to delete the certain sub-document or embedded comment
    app.delete('/comments/:commentId', async function(req, res) {
        const result = await db.collection('reviews').updateOne({
            'comments._id':ObjectId(req.params.commentId)
        }, {
            '$pull': {
                'comments': {
                    '_id':ObjectId(req.params.commentId)
                }
            }
        })
        res.json({
            'message':'comment successfully deleted',
            'result': result
        })
    })
    
}

main();

app.listen(3000, function() {
    console.log('server has started')
})