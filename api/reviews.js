const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')

const reviews = require('../data/reviews')

exports.router = router
exports.reviews = reviews

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


/*
 * Route to create a new review.
 */
router.post('/', function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {

    const review = extractValidFields(req.body, reviewSchema)

    /*
     * Make sure the user is not trying to review the same business twice.
     */
    const userReviewedThisBusinessAlready = reviews.some(
      existingReview => existingReview
        && existingReview.ownerid === review.ownerid
        && existingReview.businessid === review.businessid
    )

    if (userReviewedThisBusinessAlready) {
      res.status(403).send({
        error: "User has already posted a review of this business"
      })
    } else {
      review.id = reviews.length
      reviews.push(review)
      res.status(201).send({
        id: review.id,
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
router.get('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  if (reviews[reviewID]) {
    res.status(200).send(reviews[reviewID])
  } else {
    next()
  }
})

/*
 * Route to update a review.
 */
router.put('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  if (reviews[reviewID]) {

    if (validateAgainstSchema(req.body, reviewSchema)) {
      /*
       * Make sure the updated review has the same businessid and userid as
       * the existing review.
       */
      let updatedReview = extractValidFields(req.body, reviewSchema)
      let existingReview = reviews[reviewID]
      if (updatedReview.businessid === existingReview.businessid && updatedReview.userid === existingReview.userid) {
        reviews[reviewID] = updatedReview
        reviews[reviewID].id = reviewID
        res.status(200).send({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${updatedReview.businessid}`
          }
        })
      } else {
        res.status(403).send({
          error: "Updated review cannot modify businessid or userid"
        })
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid review object"
      })
    }

  } else {
    next()
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID)
  if (reviews[reviewID]) {
    reviews[reviewID] = null
    res.status(204).end()
  } else {
    next()
  }
})
