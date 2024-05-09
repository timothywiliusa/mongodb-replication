const router = require('express').Router()
const { ObjectId } = require ('mongodb')

const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { getDb } = require("../mongodb")

// const businesses = require('../data/businesses')
// const { reviews } = require('./reviews')
// const { photos } = require('./photos')
// const { format } = require('morgan')

exports.router = router
// exports.businesses = businesses

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
}

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res, next) {

  const db = getDb()
  try{
    const collection = db.collection("businesses")
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
      links.nextPage = `/businesses?page=${page + 1}`
      links.lastPage = `/businesses?page=${lastPage}`
    }
    if (page > 1) {
      links.prevPage = `/businesses?page=${page - 1}`
      links.firstPage = '/businesses?page=1'
    }

    const results = await collection.find({})
      .sort({_id: 1})
      .skip(start)
      .limit(numPerPage)
      .toArray()

    res.status(200).send({
      businesses: results,
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
 * Route to create a new business.
 */
router.post('/', async function (req, res, next) {

  const db = getDb()
  const collection = db.collection("businesses")
  

  if (validateAgainstSchema(req.body, businessSchema)) {
    const business = extractValidFields(req.body, businessSchema)
    business.id = await collection.countDocuments()
    
    // result = await collection.insertOne(req.body) error?
    result = await collection.insertOne(business)

    res.status(201).send({
      id: business.id,
      links: {
        business: `/businesses/${business.id}`
      }
    })
  } else {
    res.status(400).send({
      error: "Request body is not a valid business object"
    })
  }
})

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  const db = getDb()
  const businessid = parseInt(req.params.businessid)
  try{

    const collection = db.collection("businesses")
  
    const results = await collection.aggregate([
      {$match: { id: businessid }},
      {$lookup:{
          from:"reviews",
          localField:"id",
          foreignField:"businessid",
          as: "reviews"
      }}, 
      {$lookup:{
          from:"photos",
          localField:"id",
          foreignField:"businessid",
          as: "photos"
      }}
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
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
  
  const db = getDb()
  const businessid = parseInt(req.params.businessid)
  
  
  if (validateAgainstSchema(req.body, businessSchema)) {

    // businesses[businessid] = extractValidFields(req.body, businessSchema)
    // businesses[businessid].id = businessid

    const collection = db.collection("businesses")

    // check if exists
    const results = await collection.aggregate([
      {$match: { id: businessid }},
      {$match: { ownerid: req.body.ownerid }},
    ]).toArray()

    if (results.length > 0){

      collection.replaceOne(
        { "id" : businessid },
        { ...req.body }
      )
      res.status(200).send({
        links: {
          business: `/businesses/${businessid}`
        }
      })


    } else {
      res.status(403).send({
        err: "not allowed, please check ownerid in request body"
      })
    }
   


  } else {
    res.status(400).send({
      error: "Request body is not a valid business object"
    })
  }


})

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {
  
  const businessid = parseInt(req.params.businessid)
  const db = getDb()
  const collection = db.collection("businesses")

  const results = await collection.aggregate([
    {$match: { id: businessid }}
  ]).toArray()
  if(results.length > 0){

    try {
      collection.deleteOne( { id: businessid } );
    } catch (e) {
      next(e);
    }

    res.status(204).end()

  } else {
    next()
  }

})
