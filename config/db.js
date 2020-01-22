const mongoose = require('mongoose');
<<<<<<< HEAD
const config = require('config');
// const db = config.get('mongoURI');
const db = `mongodb://localhost:27017/fiterr-test-db`;
=======
>>>>>>> master

const connectDB = async () => {
    try {
<<<<<<< HEAD
        await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
=======
        await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true,  useUnifiedTopology: true });
>>>>>>> master
        console.log('MongoDB connected successfully ✔️✔️');
    } catch (err) {
        console.error(err.message);
        process.exit(1);    //kill the process if you cant connect to atlas
    }
}

module.exports = connectDB;