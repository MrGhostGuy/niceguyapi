const bcrypt = require('bcryptjs');
bcrypt.hash('test', 10).then(h => console.log('bcrypt ok:', h.substring(0, 20))).catch(e => console.log('bcrypt error:', e.message));
