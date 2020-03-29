const server = require('./server');
const PORT = process.env.PORT || 3000;
server.app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
