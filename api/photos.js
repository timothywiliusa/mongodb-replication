const router = require('express').Router()
const { ObjectId } = require ('mongodb')

const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { getDb } = require("../mongodb")

// const photos = require('../data/photos')

exports.router = router
// exports.photos = photos

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
}


router.get('/', async function (req, res, next) {

  const db = getDb()
  try{
    const collection = db.collection("photos")
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
      links.nextPage = `/photos?page=${page + 1}`
      links.lastPage = `/photos?page=${lastPage}`
    }
    if (page > 1) {
      links.prevPage = `/photos?page=${page - 1}`
      links.firstPage = '/photos?page=1'
    }

    const results = await collection.find({})
      .sort({_id: 1})
      .skip(start)
      .limit(numPerPage)
      .toArray()

    res.status(200).send({
      photos: results,
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
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {

  const db = getDb()
  const collection = db.collection("photos")
 

  if (validateAgainstSchema(req.body, photoSchema)) {
    const photo = extractValidFields(req.body, photoSchema)
    photo.id = await collection.countDocuments()
  
    const result = await collection.insertOne(photo)
    
    res.status(201).send({
      id: result.insertedId,
      links: {
        photo: `/photos/${photo.id}`,
        business: `/businesses/${req.body.businessid}`
      }
    })
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }
})

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID)

  const db = getDb()
  const businessid = parseInt(req.params.businessid)
  try{

    const collection = db.collection("photos")
  
    const results = await collection.aggregate([
      {$match: { id: photoID }},
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
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  
  const photoID = parseInt(req.params.photoID)
  const db = getDb()

  if (validateAgainstSchema(req.body, photoSchema)) {
    /*
      * Make sure the updated photo has the same businessid and userid as
      * the existing photo.
      */

    // const updatedPhoto = extractValidFields(req.body, photoSchema)
    // const existingPhoto = photos[photoID]

    const collection = db.collection("photos")

    const results = await collection.aggregate([
      {$match: { id: photoID }},
      {$match: { businessid: req.body.businessid }},
      {$match: { userid: req.body.userid }},
    ]).toArray()

    if (results.length > 0){

      collection.replaceOne(
        { "id" : photoID },
        { ...req.body }
      )

  
      res.status(200).send({
        links: {
          photo: `/photos/${photoID}`,
          business: `/businesses/${req.body.businessid}`
        }
      })


    } else {
      res.status(403).send({
        err: "not allowed, please check businessid and userid in request body"
      })
    }
    
    // if (existingPhoto && updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
    //   photos[photoID] = updatedPhoto
    //   photos[photoID].id = photoID
    //   res.status(200).send({
    //     links: {
    //       photo: `/photos/${photoID}`,
    //       business: `/businesses/${updatedPhoto.businessid}`
    //     }
    //   })
    // } else {
    //   res.status(403).send({
    //     error: "Updated photo cannot modify businessid or userid"
    //   })
    // }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }

})

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  const photoid = parseInt(req.params.photoID)
  const db = getDb()
  const collection = db.collection("photos")

  const results = await collection.aggregate([
    {$match: { id: photoid }}
  ]).toArray()
  if(results.length > 0){

    try {
      collection.deleteOne( { id: photoid } );
    } catch (e) {
      next(e);
    }

    res.status(204).end()

  } else {
    next()
  }
})
