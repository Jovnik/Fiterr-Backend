const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const app = require('./app')
connectDB();

app.listen(PORT, () => console.log(`Now listening on port ${PORT} ✔️`));
