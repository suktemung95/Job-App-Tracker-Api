const runQuery = require("../db/pool")

exports.getJobs = async (req, res) => {
    try {
        const status = req.query.status || 'any'
        const filterByStatus = status !== 'any'

        const page = Math.max(Number(req.query.page) || 1, 1)
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100)
        const offset = (page - 1) * limit

        const id = req.user.userId

        let query = ``
        let values = []

        if (filterByStatus) {
            query = `
                SELECT job_id, user_id, company_name, position, status, final_status
                FROM jobs
                WHERE user_id = $1 AND status = $2
                ORDER BY date_applied DESC
                LIMIT $3 OFFSET $4
            `
            values = [id, status, limit, offset]
        } else {
            query = `
                SELECT job_id, user_id, company_name, position, status, final_status
                FROM jobs
                WHERE user_id = $1
                ORDER BY date_applied DESC
                LIMIT $2 OFFSET $3
            `
            values = [id, limit, offset]
        }

        const result = await runQuery(query, values)

        let countQuery = ``
        let countValues = []

        if (filterByStatus) {
            countQuery = `
                SELECT COUNT(*)
                FROM jobs
                WHERE user_id = $1 AND status = $2
            `
            countValues = [id, status]
        } else {
            countQuery = `
                SELECT COUNT(*)
                FROM jobs
                WHERE user_id = $1
            `
            countValues = [id]
        }

        const countResult = await runQuery(countQuery, countValues)

        const totalItems = Number(countResult.rows[0].count)
        const totalPages = Math.ceil(totalItems / limit)

        const hasNextPage = page < totalPages
        const hasPreviousPage = page > 1

        return res.status(200).json({
            data: result.rows,
            pagination: {
                page,
                limit,
                offset,
                totalItems,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Database error" })
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

exports.rejectJob = async (req, res) => {
    try {
        const id = req.user.userId
        const jobId = req.params.jobId

        const query = `
            UPDATE jobs
            SET final_status = status, status = $1, final_status_date = NOW()
            WHERE job_id = $2 AND user_id = $3
            RETURNING *
            `
        const values = ['Rejected', jobId, id]
        const result = await runQuery(query, values)

        return res.status(200).json({
            success: true,
            job: result.rows[0]
        })
    } catch (err) {
        return res.status(500).json({ error: "Database error"})
    }
}