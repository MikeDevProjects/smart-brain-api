const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const dotenv = require('dotenv');
const morgan = require('morgan');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');


dotenv.config();
const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI
});

const app = express();

const whiteList = ['http://localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res)=> { res.send("ITS WORKING") })
app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', register.registrationProcess(db, bcrypt))
app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileUpdate(req, res, db)})
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res)})

app.listen(process.env.PORT, ()=> {
  console.log(`app is running on port ${process.env.PORT}`);
})