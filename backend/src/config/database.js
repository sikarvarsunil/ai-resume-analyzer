const mongoose = require('mongoose');

async function conntectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('connect to the DB')
    } catch (err) {
        console.log('DB error', err)
    }
    
}

module.exports = conntectToDB