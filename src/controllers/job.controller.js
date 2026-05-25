const runQuery = require("../db/pool")

exports.getJobs = async (req, res) => {
    try {
        const id = req.user.userId
        const query = `SELECT job_id, user_id, company_name, position, status
        FROM jobs WHERE user_id = $1`
        const values = [id]
        const result = await runQuery(query, values)

        if (result.rows.length === 0) {
            return res.status(200).json({ jobs: [] });
        }

        const jobs = result.rows

        return res.status(200).json({jobs})
    } catch (err) {
        return res.status(500).json({ error: "Database error"})
    }
}