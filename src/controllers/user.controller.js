const runQuery = require("../db/pool")

exports.getMe = async (req, res) => {
    try {
        const id = req.user.userId
        const query = `SELECT id, username, created_at
        FROM users WHERE id=$1`
        const values = [id]
        const result = await runQuery(query, values)

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User does not exist"})
        }

        const user = result.rows[0]

        return res.status(200).json({
            id: user.id,
            created_at: user.created_at,
            username: user.username,
        })
    } catch (err) {
        return res.status(500).json({ error: "Database error"})
    }
}