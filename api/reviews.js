const router = require('express').Router()
const { ObjectId } = require ('mongodb')

const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { getDb } = require("../mongodb")


// const reviews = require('../data/reviews')

exports.router = router
// exports.reviews = reviews

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
}

router.get('/', async function (req, res, next) {

  const db = getDb()
  try{
    const collection = db.collection("reviews")
    const count = await collection.countDocuments()
    let page = parseInt(req.query.page) || 1
    const numPerPage = 10
    const lastPage = Math.ceil(count / numPerPage)
    page = page > lastPage ? lastPage : page
    page = page < 1 ? 1 : page
    
    const start = (page - 1) * numPerPage
    // const end = start + numPerPage
    // const pageBusinesses = businesses.slice(start, end)

    const links = {}
    if (page < lastPage) {
      links.nextPage = `/reviews?page=${page + 1}`
      links.lastPage = `/reviews?page=${lastPage}`
    }
    if (page > 1) {
      links.prevPage = `/reviews?page=${page - 1}`
      links.firstPage = '/reviews?page=1'
    }

    const results = await collection.find({})
      .sort({_id: 1})
      .skip(start)
      .limit(numPerPage)
      .toArray()

    res.status(200).send({
      reviews: results,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: count,
      links: links
    })

  } catch (e) {
    next(e)
  }
  
})
/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {

  const db = getDb()
  const collection = db.collection("reviews")

  if (validateAgainstSchema(req.body, reviewSchema)) {

    const review = extractValidFields(req.body, reviewSchema)
    
    /*
     * Make sure the user is not trying to review the same business twice.
     */
    // const userReviewedThisBusinessAlready = reviews.some(
    //   existingReview => existingReview
    //     && existingReview.ownerid === review.ownerid
    //     && existingReview.businessid === review.businessid
    // )

    const resultA = await collection.aggregate([
      {$match: { userid: review.userid }},
      {$match: { businessid: review.businessid }}
      
    ]).toArray()

    // console.log(resultA)

    if (resultA.length > 0) {
      res.status(403).send({
        error: "User has already posted a review of this business"
      })
    } else {
      // review.id = reviews.length
      review.id = await collection.countDocuments()
      const resultB = await collection.insertOne(review)

      // reviews.push(review) FILL
      res.status(201).send({
        id_: resultB.insertedId,
        links: {
          review: `/reviews/${review.id}`,
          business: `/businesses/${review.businessid}`
        }
      })
    }

  } else {
    res.status(400).send({
      error: "Request body is not a valid review object"
    })
  }
})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  const db = getDb()
  // const businessid = parseInt(req.params.businessid)
  try{

    const collection = db.collection("reviews")
  
    const results = await collection.aggregate([
      {$match: { id: reviewID }},
    ]).toArray()

    if(results.length > 0){
      res.status(200).send(results[0])
    } else {
      next()
    }

  } catch(e){
    next(e)
  }
})

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  
  const reviewID = parseInt(req.params.reviewID)
  const db = getDb()
 
  if (validateAgainstSchema(req.body, reviewSchema)) {
    /*
      * Make sure the updated review has the same businessid and userid as
      * the existing review.
      */

    // let updatedReview = extractValidFields(req.body, reviewSchema)
    // let existingReview = reviews[reviewID]

    const collection = db.collection("reviews")


    // check if exists
    const results = await collection.aggregate([
      {$match: { id: reviewID }},
      {$match: { businessid: req.body.businessid }},
      {$match: { userid: req.body.userid }},
    ]).toArray()
    

    if (results.length > 0){

      collection.replaceOne(
        { "id" : reviewID },
        { ...req.body }
      )

      res.status(200).send({
        links: {
          review: `/reviews/${reviewID}`,
          business: `/businesses/${req.body.businessid}`
        }
      })


    } else {
      res.status(403).send({
        err: "not allowed, please check businessid and userid in request body"
      })
    }
   
      
  
  } else {
    res.status(400).send({
      error: "Request body is not a valid review object"
    })
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  const db = getDb()
  const collection = db.collection("reviews")

  const results = await collection.aggregate([
    {$match: { id: reviewID}}
  ]).toArray()
  if(results.length > 0){

    try {
      collection.deleteOne( { id: reviewID } );
    } catch (e) {
      next(e);
    }

    res.status(204).end()

  } else {
    next()
  }
})
