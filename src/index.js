const express = require("express");
const app = express();
const database = require("./config/sequelize");
const { registerUser, loginUser, deleteUser, getAirport, recharge } = require("./controllers/userController");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.get("/api/delete", deleteUser)
app.get("/api/getAirport", getAirport)
app.post("/api/recharge", recharge)

const port = 3000;
const init = async () => {
    console.log("Testing connection to the database");
    try {
        await database.authenticate();
        console.log("Database successfully connected!");
        app.listen(port, function () {
            console.log(`Application is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

init();
