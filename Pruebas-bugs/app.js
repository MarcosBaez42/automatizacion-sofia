// This code creates a new server instance and then starts it listening on port of environment variable

import Server from "./server.js";
import './utils/backup.js';

const server = new Server();

server.listen();