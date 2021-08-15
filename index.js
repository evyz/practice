require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./routes')

const PORT = 8000 || process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

app.listen(PORT, () => {
    console.log(`Server has been started on ${PORT} port.`)
})