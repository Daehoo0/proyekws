const express = require('express')
const app = express()
const port = 3000

const {
  register,
  } = require("./controllers/controller");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", register);



app.listen(port, () => console.log(`Example app listening on port ${port}!`))