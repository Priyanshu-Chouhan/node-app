const cluster = require('cluster');
const os = require('os');
const express = require('express');
const taskQueue = require('./queue');

const numCPUs = 2; // Number of replica sets

if (cluster.isMaster) {
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Restart a worker on failure
    });
} else {
    const app = express();
    app.use(express.json());

    // Route to handle tasks
    app.post('/process-task', taskQueue.processTask);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${PORT}`);
    });
}
