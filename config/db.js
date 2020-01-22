const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected successfully ✔️✔️');
    } catch (err) {
        console.error(err.message);
        process.exit(1);    //kill the process if you cant connect to atlas
    }
}

module.exports = connectDB;