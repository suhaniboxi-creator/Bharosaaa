/**
 * Queue manager - simulates load-balanced queue processing
 * In production, this would use Redis/RabbitMQ
 */

const queues = {
  registration: [],
  biometric: [],
  entry: [],
  exit: [],
};

let processedCount = 0;
let startTime = Date.now();

function enqueue(queueName, item) {
  if (!queues[queueName]) queues[queueName] = [];
  const position = queues[queueName].length + 1;
  queues[queueName].push({
    ...item,
    enqueuedAt: Date.now(),
    position,
  });
  return { position, estimatedWait: position * 8 }; // ~8s per person
}

function dequeue(queueName) {
  if (!queues[queueName] || queues[queueName].length === 0) return null;
  processedCount++;
  return queues[queueName].shift();
}

function getQueueStatus(queueName) {
  const q = queues[queueName] || [];
  return {
    queueName,
    depth: q.length,
    estimatedWait: q.length * 8,
    avgProcessingTime: 8,
  };
}

function getAllQueueStatus() {
  return Object.keys(queues).map(name => getQueueStatus(name));
}

function getThroughput() {
  const elapsed = (Date.now() - startTime) / 60000; // minutes
  return elapsed > 0 ? Math.round(processedCount / elapsed) : 0;
}

module.exports = { enqueue, dequeue, getQueueStatus, getAllQueueStatus, getThroughput };
