const runQuery = require("../db/pool")

exports.getJobs = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const offset = (page - 1) * limit

        const id = req.user.userId
        const query = `SELECT job_id, user_id, company_name, position, status
        FROM jobs WHERE user_id = $1
        LIMIT $2 OFFSET $3
        ORDER BY date_applied DESC`
        const values = [id, limit, offset]
        const result = await runQuery(query, values)

        if (result.rows.length === 0) {
            return res.status(200).json({ jobs: [] });
        }

        const countQuery = `SELECT COUNT(*) FROM jobs WHERE user_id = $1`
        const countValues = [id]
        const countResult = await runQuery(countQuery, countValues)
        const totalItems = countResult.rows[0].count
        const totalPages = Math.ceil(totalItems / limit)

        const hasNextPage = page < totalPages
        const hasPreviousPage = page > 1
        
        const jobs = result.rows
        return res.status(200).json(
            {
                data: jobs,
                pagination: {
                    page: page,
                    limit: limit,
                    offset: offset,
                    totalItems: totalItems,
                    totalPages: totalPages,
                    hasNextPage: hasNextPage,
                    hasPreviousPage, hasPreviousPage
                }
             })
    } catch (err) {
        return res.status(500).json({ error: "Database error"})
    }
}

exports.postJob = async (req, res) => {
    try {
        const userId = req.user.userId
        const allowedFields = ["company_name", "company_site", "job_post_site", "location", "hourly_pay", "monthly_pay", "yearly_pay", "job_type", "date_applied", "status", "final_status", "final_status_date", "position"]
        const columns = ['user_id']
        const values = [userId]
        const placeholders = ['$1']

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                columns.push(field)
                values.push(req.body[field])
                placeholders.push(`$${values.length}`)
            }
        }

        const query = `INSERT INTO jobs (${columns.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *`

        const result = await runQuery(query, values)

        return res.status(201).json({
            job: result.rows[0]
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Database error"})
    }
}