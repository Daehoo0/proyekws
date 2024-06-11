const express = require("express");
const app = express();
const database = require("./config/sequelize");
const { registerUser, loginUser, deleteUser, testAxios, getAirport } = require("./controllers/userController");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", registerUser);
app.get("/api/login", loginUser);
app.get("/api/delete", deleteUser)
app.get("/api/test", getAirport)

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
