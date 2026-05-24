const express = require("express");
const router = express.Router();

const middleware = require('../middleware/auth.middleware')
const userController = require("../controllers/user.controller")

router.get("/me", middleware, userController.getMe)


module.exports = router;