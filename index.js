const express = require('express')
const app = express()
const port = 3000

const {
  register,login 
  } = require("./controllers/controller");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", register);
app.get("/api/login", login );


app.listen(port, () => console.log(`Example app listening on port ${port}!`))