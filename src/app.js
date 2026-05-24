require("dotenv").config();
const express = require("express");
const app = express();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes")
const port = 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log("App listening on port:", port);
});
