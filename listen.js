const express = require('express')
const app = express()
const port = 8000

app.use(express.text())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html')
})

app.use('/bundle.js', express.static('bundle.js'))
app.use('/static', express.static('static'))

app.post('/debug', (req, res) => {
  console.log(req.body)
  res.end()
})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})