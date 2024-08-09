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
import FetchSkills from "./controller/fetchSkills";
import hashPassword from "./middlewares/hashPassword";
import nodemailer from "nodemailer";  // For sending emails
import crypto from "crypto";  // For generating tokens


import fetchPullRequests from "./controller/fetchPullRequests";
import deleteUserData from "./controller/deleteUserData";

const router = Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/", (_, res) => {
	logger.debug("Welcoming everyone...");
	res.json({ message: "Read me, Hire me!" });
});

router.post("/sign-up", hashPassword, async (req, res) => {
	const { email, password, passwordHash, userType, userGithub } = req.body;

	// Check for valid email format
	if (!email || !emailRegex.test(email)) {
		return res.status(422).json({ message: "Invalid email format" });
	}

	if (!password) {
		return res.status(422).json({ message: "Password field is required" });
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
		const githubUsername = userGithub || null;

		const result = await db.query(
			"INSERT INTO users (email, password_hash, user_type, github_username) VALUES ($1, $2, $3, $4) RETURNING id ",
			[email, passwordHash, userType, githubUsername]
		);

		const newUserID = result.rows[0].id;

		if (userType === "graduate" && userGithub) {
			await fetchReadme(userGithub);
			await fetchActivity(userGithub);

			await FetchSkills(userGithub);

			await fetchPinnedProjects(userGithub);
		}

		res.status(200).json({ success: true, data: { id: newUserID } });
	} catch (error) {
		console.error(error);

		if (error.code === "23505") {
			return res.status(409).json({
				success: false,
				error: "Email or GithubUsername already exists",
			});
		}
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
		await deleteUserData(userId)

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

router.post("/sign-in", hashPassword, async (req, res) => {
	const { email, password, passwordHash } = req.body;

	if (!email || !password) {
		return res.status(422).json({ message: "Email and password are required" });
	}

	try {
		const result = await db.query("SELECT * FROM users WHERE email = $1", [
			email,
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

		const {
			id: userId,
			user_type: userType,
			github_username: userGithub,
		} = user;
		if (userId) {
			deleteUserData(userId);
		}
		if (userType === "graduate" && userGithub) {
			await fetchReadme(userGithub);
			await fetchActivity(userGithub);
			await fetchPullRequests(userGithub)
			await FetchSkills(userGithub);
			await fetchPinnedProjects(userGithub);
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, userType: user.user_type },
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
	hashPassword,
	roleBasedAuth("graduate", "mentor", "recruiter"),
	async (req, res) => {
		const userId = req.params.id;
		const { password, passwordHash } = req.body;

		if (!password) {
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

router.get(
	"/getAllGradUsers",
	roleBasedAuth("mentor", "recruiter"),
	async (_, res) => {
		try {
			const result = await db.query(
				"SELECT id, email, github_username FROM users WHERE user_type = 'graduate'"
			);
			res.status(200).json({ success: true, data: result.rows });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "Failed to fetch User from the database",
			});
		}
	}
);
router.get(
	"/getAllGradUsers/:filteredSkill",
	roleBasedAuth("mentor", "recruiter"),
	async (req, res) => {
		const filteredInput = `%${req.params.filteredSkill}%`;
		try {
			const result = await db.query(
				`SELECT u.id, u.email, u.github_username
                FROM users u
                JOIN profiles p ON u.id = p.user_id
                WHERE u.user_type = 'graduate' AND p.skills ILIKE $1`,
				[filteredInput]
			);
			res.status(200).json({ success: true, data: result.rows });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "Failed to fetch User from the database",
			});
		}
	}
);

router.get(
	"/getGradUsersByName/:filteredName",
	roleBasedAuth("mentor", "recruiter"),
	async (req, res) => {
		const filteredName = `%${req.params.filteredName}%`;
		try {
			const result = await db.query(
				`SELECT u.id, u.email, u.github_username
                FROM users u
                WHERE u.user_type = 'graduate' AND u.github_username ILIKE $1`,
				[filteredName]
			);
			res.status(200).json({ success: true, data: result.rows });
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "Failed to fetch User from the database",
			});
		}
	}
);


// 1. Route to request a password reset
router.post("/request-password-reset", async (req, res) => {
	const { email } = req.body;

	if (!email || !emailRegex.test(email)) {
		return res.status(422).json({ message: "Invalid email format" });
	}

	try {
		const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

		if (user.rows.length === 0) {
			return res.status(404).json({ message: "No user found with that email address." });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour

		await db.query(
			"UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
			[resetToken, resetTokenExpiry, email]
		);

		// Send email with reset link
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: "readmehireme@gmail.com",
				pass: `${config.emailAccountPassword}`,
			},
		});

		const resetUrl = `${config.appUrl}/reset-password?token=${resetToken}&email=${email}`;
		const mailOptions = {
			to: email,
			from: "readmehireme@gmail.com",
			subject: "Password Reset",
			text: `Please click on the following link, or paste it into your browser to complete the password reset:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
		};

		transporter.sendMail(mailOptions, (err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ message: "Error sending reset email." });
			}
			res.status(200).json({ message: "Password reset email sent successfully." });
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to initiate password reset." });
	}
});

// 2. Route to reset the password
router.post("/reset-password", hashPassword, async (req, res) => {
	const { email, token, password, passwordHash } = req.body;

	if (!email || !token || !password) {
		return res.status(422).json({ message: "All fields are required." });
	}

	try {
		const user = await db.query(
			"SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > $3",
			[email, token, Date.now()]
		);

		if (user.rows.length === 0) {
			return res.status(400).json({ message: "Invalid or expired token." });
		}

		await db.query(
			"UPDATE users SET password_hash = $1, reset_token = null, reset_token_expiry = null WHERE email = $2",
			[passwordHash, email]
		);

		res.status(200).json({ message: "Password has been reset successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to reset password." });
	}
});
router.use("/info", infoRouter);
export default router;
