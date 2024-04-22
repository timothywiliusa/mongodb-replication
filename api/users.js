const router = require('express').Router()

exports.router = router

const { businesses } = require('./businesses')
const { reviews } = require('./reviews')
const { photos } = require('./photos')

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', function (req, res) {
  const userid = parseInt(req.params.userid)
  const userBusinesses = businesses.filter(business => business && business.ownerid === userid)
  res.status(200).send({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', function (req, res) {
  const userid = parseInt(req.params.userid)
  const userReviews = reviews.filter(review => review && review.userid === userid)
  res.status(200).send({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', function (req, res) {
  const userid = parseInt(req.params.userid)
  const userPhotos = photos.filter(photo => photo && photo.userid === userid)
  res.status(200).send({
    photos: userPhotos
  })
})
