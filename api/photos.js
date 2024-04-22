const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')

const photos = require('../data/photos')

exports.router = router
exports.photos = photos

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
}


/*
 * Route to create a new photo.
 */
router.post('/', function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    const photo = extractValidFields(req.body, photoSchema)
    photo.id = photos.length
    photos.push(photo)
    res.status(201).send({
      id: photo.id,
      links: {
        photo: `/photos/${photo.id}`,
        business: `/businesses/${photo.businessid}`
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
router.get('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  if (photos[photoID]) {
    res.status(200).send(photos[photoID])
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.put('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  if (photos[photoID]) {

    if (validateAgainstSchema(req.body, photoSchema)) {
      /*
       * Make sure the updated photo has the same businessid and userid as
       * the existing photo.
       */
      const updatedPhoto = extractValidFields(req.body, photoSchema)
      const existingPhoto = photos[photoID]
      if (existingPhoto && updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
        photos[photoID] = updatedPhoto
        photos[photoID].id = photoID
        res.status(200).send({
          links: {
            photo: `/photos/${photoID}`,
            business: `/businesses/${updatedPhoto.businessid}`
          }
        })
      } else {
        res.status(403).send({
          error: "Updated photo cannot modify businessid or userid"
        })
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid photo object"
      })
    }

  } else {
    next()
  }
})

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID)
  if (photos[photoID]) {
    photos[photoID] = null
    res.status(204).end()
  } else {
    next()
  }
})
