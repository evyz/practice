const express = require('express')
const router = express()

const tag = require('../controllers/tag')
const { check } = require('express-validator')

router.post('/', [
    check('name', 'Длина name должна быть короче 100 символов').isLength({ max: 100 }),
    check('name', 'Название не должно быть пустым').notEmpty()
], tag.create)
router.get('/', tag.get)
router.get('/:id', tag.getOne)
router.put('/:id', tag.put)
router.delete('/:id', tag.delete)

module.exports = router