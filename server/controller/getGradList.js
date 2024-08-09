import db from "../db";

export default async function getGradList(req, res, next) {
	try {
		const userListData = await db.query(
			`
            SELECT
                u.id AS user_id,
                COUNT(DISTINCT p.id) AS project_count,
                COUNT(DISTINCT pr.id) AS pull_request_count,
                ARRAY_AGG(pr.created_at) AS pr_dates_array,
                prof.avatar,
                u.github_username
            FROM
                users u
            LEFT JOIN
                projects p ON u.id = p.user_id
            LEFT JOIN
                pull_requests pr ON u.id = pr.user_id
            LEFT JOIN
                profiles prof ON u.id = prof.user_id
            WHERE
                u.user_type = 'graduate'
            GROUP BY
                u.id, prof.avatar, u.github_username;
            `
		);

		if (userListData.rows.length == 0) {
			return res.status(404).json({ error: "No user data found" });
		}

		res.status(200).json({ graduateList: userListData.rows });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
}
