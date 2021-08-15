const express = require('express')
const router = express()

const userTag = require('../controllers/userTag')

router.post('/', userTag.post)
router.delete('/:id', userTag.delete)
router.get('/my', userTag.get)

module.exports = router