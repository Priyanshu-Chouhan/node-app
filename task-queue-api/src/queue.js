const { RateLimiterMemory } = require('rate-limiter-flexible');
const taskLogger = require('./taskLogger');

// Rate limiting: 1 task per second, 20 tasks per minute per user
const rateLimiterPerUser = new RateLimiterMemory({
    points: 20, // 20 tasks
    duration: 60, // per 60 seconds
    blockDuration: 1, // block for 1 second if limit reached
});

// Task queue per user
const userQueues = new Map();

async function processTask(req, res) {
    const userId = req.body.userId;
    const taskData = req.body.taskData;

    if (!userId || !taskData) {
        return res.status(400).json({ error: 'Invalid request structure' });
    }

    try {
        await rateLimiterPerUser.consume(userId, 1);

        // Ensure a queue exists for this user
        if (!userQueues.has(userId)) {
            userQueues.set(userId, []);
        }

        // Add task to user's queue
        userQueues.get(userId).push(() => executeTask(userId, taskData));

        // Process the task
        processUserQueue(userId);

        res.status(200).json({ message: 'Task queued for processing' });
    } catch (rejRes) {
        res.status(429).json({ error: 'Rate limit exceeded. Task is queued.' });
    }
}

function processUserQueue(userId) {
    const queue = userQueues.get(userId);
    if (queue && queue.length > 0) {
        const task = queue.shift();
        setTimeout(task, 1000); // Process one task per second
    }
}

async function executeTask(userId, taskData) {
    taskLogger.logTaskCompletion(userId);
    processUserQueue(userId);
}

module.exports = {
    processTask,
};
