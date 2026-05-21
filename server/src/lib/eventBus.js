const EventEmitter = require('events');

class VaultEventBus extends EventEmitter {}

const eventBus = new VaultEventBus();
// Increase max listeners to prevent memory leak warnings as modules scale
eventBus.setMaxListeners(50);

module.exports = eventBus;
