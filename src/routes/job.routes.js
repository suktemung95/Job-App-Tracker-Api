const express = require('express')
const router = express.Router()

const middleware = require("../middleware/auth.middleware")

const jobController = require("../controllers/job.controller")

router.get("/", middleware, jobController.getJobs)
router.post("/", middleware, jobController.postJob)

module.exports = router