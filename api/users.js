const router = require('express').Router()
const { ObjectId } = require ('mongodb')


exports.router = router

const { getDb } = require("../mongodb")

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  const userid = parseInt(req.params.userid)
  // console.log(userid)
  // const userBusinesses = businesses.filter(business => business && business.ownerid === userid)
  // res.status(200).send({
  //   businesses: userBusinesses
  // })
  const db = getDb()

  const collection = db.collection("businesses")
  const results = await collection.aggregate([
    {$match: { ownerid: userid }},
  ]).toArray()

  
  // console.log(results)

  if(results.length > 0){

    res.status(200).send({
      businesses: results
    })
    
  } else {
    res.status(404).send({
      err: "no businesses found with that ownerid"
    })
  }
  
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res) {
  const userid = parseInt(req.params.userid)
  const db = getDb()

  const collection = db.collection("reviews")

  const results = await collection.aggregate([
    {$match: { userid: userid }},
  ]).toArray()

  if(results.length > 0){

    res.status(200).send({
      reviews: results
    })
    
  } else {
    res.status(404).send({
      err: "This user has not posted any reviews"
    })
  }

})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {
  const userid = parseInt(req.params.userid)
  const db = getDb()

  const collection = db.collection("photos")

  const results = await collection.aggregate([
    {$match: { userid: userid }},
  ]).toArray()

  if(results.length > 0){

    res.status(200).send({
      photos: results
    })
    
  } else {
    res.status(404).send({
      err: "This user has not posted any photos"
    })
  }



  // const userPhotos = photos.filter(photo => photo && photo.userid === userid)
  // res.status(200).send({
  //   photos: userPhotos
  // })
})
