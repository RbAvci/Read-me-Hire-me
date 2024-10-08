import http from "node:http";

import app from "./app";
import { connectDb, disconnectDb } from "./db";
import config from "./utils/config";
import logger from "./utils/logger";
import { startCron } from "./utils/cron";

const server = http.createServer(app);

server.on("listening", () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	logger.info("listening on: %s", bind);
});

process.on("SIGTERM", () => server.close(() => disconnectDb()));

connectDb().then(() => {
	startCron();
	server.listen(config.port);
});
