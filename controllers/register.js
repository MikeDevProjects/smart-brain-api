const redis = require('redis');
const jwt = require('jsonwebtoken');

const redisClient = redis.createClient(process.env.REDIS_URI);

const registrationProcess = (db, bcrypt) => (req, res) => {
  return handleRegister(db, bcrypt, req, res)
    .then(data => {
      return data.id ? createSessions(data): Promise.reject(data);
    })
    .then(session => res.json(session))
    .catch(err => res.status(400).json(err));
};

const createSessions = user => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return {success: 'true', userId: id, token };
    })
    .catch(console.log())
}

const signToken = email => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' });
}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
}

const handleRegister = (db, bcrypt, req, res) => {
  const { email, name, password, age } = req.body;
  if (!email || !name || !password || !age) {
    console.log('SOMETHING IS MISSING BRO');
    return Promise.reject('Unable to register!');
  }
  const hash = bcrypt.hashSync(password);
  return db.transaction(trx => {
    return trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          email: loginEmail[0],
          name: name,
          joined: new Date(),
          age: age
        })
        .then(user => user[0])
        .catch(err => Promise.reject("Unable to register!", err))
    })
  })
  .catch(err => Promise.reject("Unable to register!", err))
}

module.exports = {
  registrationProcess: registrationProcess,
  createSessions: createSessions
};


