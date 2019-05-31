const jwt = require('jsonwebtoken');
const redis = require('redis');

const register = require('./register');

// setup Redis
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }
  return db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => user[0])
          .catch(err => Promise.reject("unable to get user"));
      } else {
        return Promise.reject("wrong credentials");
      }
    })
    .catch(err => Promise.reject("wrong credentials"));
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply ) {
      return res.status(400).json('Unauthorized');
    }
    return res.json({id: reply});
  })
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  console.log(req);
  const { authorization } = req.headers;
  return authorization ?
    getAuthTokenId(req, res) :
    handleSignin(db, bcrypt, req, res)
      .then(data => {
        return data.id && data.email ? register.createSessions(data) : Promise.reject(data);
      })
      .then( session => res.json(session))
      .catch(err => res.status(400).json(err));
};

module.exports = {
  signinAuthentication: signinAuthentication
};
