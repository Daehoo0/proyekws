const express = require("express");
const app = express()
const database = require("./config/sequelize")
// const userRouter = require("./routes/users.js")
// const topupRouter = require("./routes/topup.js")
// const rechargeRoute = require("./routes/recharge.js")
// const placeRoute = require("./routes/places.js")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.use("/api/users", userRouter)
// app.use("/api/topup", topupRouter)
// app.use("/api/recharge", rechargeRoute)
// app.use("/api/places", placeRoute)

const port = 3000;
const init = async () => { 
    console.log("Testing connection to database");
    try {
        await database.authenticate(); 
        console.log("Database Successfully connected!");
        app.listen(port, function(){
            console.log(`Application is running at http://localhost:${port}`);
        })
    } catch (error) { 
        console.log(error);
    }
}

init()