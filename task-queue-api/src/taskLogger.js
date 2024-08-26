const fs = require('fs');
const path = require('path');
const pino = require('pino');

const logFile = path.join(__dirname, '..', 'task-log.json');
const logger = pino(fs.createWriteStream(logFile));

function logTaskCompletion(userId) {
    const timestamp = new Date().toISOString();
    logger.info({ userId, timestamp, message: 'Task completed' });
}

module.exports = {
    logTaskCompletion,
};
