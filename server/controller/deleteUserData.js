import db from "../db";

export default async function fetchReadme(req, res) {
    const userId = req.params.id;
	try {
		const userResponse = await db.query(
            `SELECT * FROM users WHERE userId = $1`,
            [userId]
        );

        if(userResponse.rows.length === 0){
            return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

		try {
			const result = await db.query(
				`DELETE FROM activities WHERE user_id = $1;
                DELETE FROM profiles WHERE user_id = $1;
                DELETE FROM projects WHERE user_id = $1;
                DELETE FROM pull_requests WHERE user_id = $1;
                DELETE FROM readmes WHERE user_id = $1;
                DELETE FROM users WHERE user_id = $1;
                `,
				[userId]
			);
			return { result: result, message: "successfully added to db" };
		} catch (error) {
			return { error: error, message: "Cannot connect to db" };
		}
	} catch (error) {
		return { error: error, message: "Cannot connect to db" };
	}
}