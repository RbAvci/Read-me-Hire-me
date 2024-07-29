import { Router } from "express";
import fetchPinnedProjects from "./controller/fetchPinnedProjects";
import logger from "./utils/logger";
import db from "./db";
import jwt from "jsonwebtoken";
import config from "./utils/config";
import { roleBasedAuth } from "./utils/middleware";
import fetchActivity from "./controller/fetchActivity";
import fetchReadme from "./controller/fetchReadme";
import infoRouter from "./routes/getInfoRouter";
const router = Router();

router.get("/", (_, res) => {
	logger.debug("Welcoming everyone...");
	res.json({ message: "Read me, Hire me!" });
});

// router.get("/fetchPinnedProjects", async (_, res) => {
// 	const test = await fetchPinnedProjects("RbAvci");
// 	res.send(test);
// });

router.post("/users", async (req, res) => {
	const { username, passwordHash, userType, userGithub } = req.body;

	if (!username) {
		return res.status(422).json({ message: "Username field is required" });
	}
	if (!passwordHash) {
		return res.status(422).json({ message: "Password_hash field is required" });
	}
	if (!userType) {
		return res.status(422).json({ message: "User_type field is required" });
	}
	if (userType == "graduate" && !userGithub) {
		return res
			.status(422)
			.json({ message: "Github_username field is required" });
	}

	try {
		const result = await db.query(
			"INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id ",
			[username, passwordHash, userType]
		);

		const newUserID = result.rows[0].id;

		if (userType === "graduate" && userGithub) {
			await db.query("UPDATE users SET github_username = $2 WHERE id = $1", [
				newUserID,
				userGithub,
			]);

			await fetchReadme(userGithub);
			await fetchActivity(userGithub);
			await fetchPinnedProjects(userGithub);
		}

		res.status(200).json({ success: true, data: { id: newUserID } });
	} catch (error) {
		if (error.code === "23505") {
			return res
				.status(409)
				.json({ success: false, error: "Username already exists" });
		}
		console.log(error);
		res.status(500).json({
			success: false,
			error: "Failed to create a new User into database",
		});
	}
});

router.get(
	"/users/:id",
	roleBasedAuth("graduate", "mentor", "recruiter"),
	async (req, res) => {
		const userId = req.params.id;
		try {
			const result = await db.query("SELECT * FROM users WHERE id = $1", [
				userId,
			]);

			if (result.rows.length === 0) {
				return res
					.status(404)
					.json({ success: false, message: "User not found" });
			}

			res.status(200).json({ success: true, data: result.rows[0] });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "Failed to fetch User from the database",
			});
		}
	}
);

router.delete("/users/:id", async (req, res) => {
	const userId = req.params.id;

	try {
		const result = await db.query(
			"DELETE FROM users WHERE id = $1 RETURNING id",
			[userId]
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, data: { id: result.rows[0].id } });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Failed to delete User from the database",
		});
	}
});

router.post("/sign-in", async (req, res) => {
	const { username, passwordHash } = req.body;

	if (!username || !passwordHash) {
		return res
			.status(422)
			.json({ message: "Username and password are required" });
	}

	try {
		const result = await db.query("SELECT * FROM users WHERE username = $1", [
			username,
		]);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		const user = result.rows[0];

		if (user.password_hash !== passwordHash) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid password" });
		}

		const token = jwt.sign(
			{ id: user.id, username: user.username, userType: user.user_type },
			config.jwtSecret,
			{ expiresIn: "1h" }
		);

		user.token = token;
		res
			.status(200)
			.json({ success: true, data: { id: user.id, user: { ...user, token } } });
	} catch (error) {
		res.status(500).json({ success: false, error: "Failed to log in" });
	}
});

router.put(
	"/users/:id/password",
	roleBasedAuth("graduate", "mentor", "recruiter"),
	async (req, res) => {
		const userId = req.params.id;
		const { passwordHash } = req.body;

		if (!passwordHash) {
			return res
				.status(422)
				.json({ message: "Password_hash field is required" });
		}

		try {
			const result = await db.query(
				"UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id",
				[passwordHash, userId]
			);

			if (result.rows.length === 0) {
				return res
					.status(404)
					.json({ success: false, message: "User not found" });
			}

			res.status(200).json({ success: true, data: { id: result.rows[0].id } });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "Failed to update User's password in the database",
			});
		}
	}
);
router.use("/info", infoRouter);
export default router;
