require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');
const conntectToDB = require('./src/config/database');


conntectToDB();

app.listen(config.PORT, () => {
    console.log('server is starting on', config.PORT)
})
