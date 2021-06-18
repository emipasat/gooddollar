// NOTE: this server is purely a dev-mode server. In production, the
// server/index.js server also serves the API routes.

// Configure process.env with .env.* files
require('./env').configureEnv();

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./apiRouter');
const wellKnownRouter = require('./wellKnownRouter');

const radix = 10;
const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
const app = express();

// NOTE: CORS is only needed in this dev API server because it's
// running in a different port than the main app.
// app.use(
//   cors({
//     origin: process.env.REACT_APP_CANONICAL_ROOT_URL, //TODO security
//     credentials: true, ??????? ce face??? oricum e doar pt local?
//   })
// );

const allowedOrigins = ["http://localhost:3500", "https://gooddev.netlify.app", "https://wallet.gooddollar.org"];
app.use(function(req, res, next) {
  let origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
  }

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //res.setHeader('Access-Control-Allow-Credentials', true);

  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );
  next();
});

app.use(cookieParser());
app.use('/.well-known', wellKnownRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
});
