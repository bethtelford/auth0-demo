require('dotenv').config();
const express = require('express'),
  bodyParser = require('body-parser'),
  massive = require('massive'),
  session = require('express-session'),
  passport = require('passport'),
  Auth0 = require('passport-auth0'),
  PORT = 4000;
const { SESSION_SECRET } = process.env;

const server = express();

massive(process.env.DB_CONNECTION).then(db => {
  server.set('db', db);
  console.log('db connected')
})
server.use(bodyParser.json());
server.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
server.use(passport.initialize());
server.use(passport.session());

// 2. Endpoint uses these instructions
passport.use(new Auth0({
  // 2.1 Configuration object that allows our server to connect to our Auth0 account
  domain: process.env.AUTH_DOMAIN,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: 'openid email profile'
}, function (accessToken, refreshToken, extraParams, profile, done) {
  // 2.2 Callback function that fires once the user has successfully authenticated with Auth0
  server.get('db').check_user(profile.id).then(user => {
    if (user[0]) {
      // 2.3 When 'done' is invoked, we move to the next step
      done(null, user[0]);
    } else {
      server.get('db').register_user(profile.displayName, profile.emails[0].value, profile.picture, profile.id).then(user => {
        done(null, user[0]);
      })
    }
  })
}))
// 3. Serialize (fires after authenticating with Auth0)
passport.serializeUser((user, done) => {
  // 3.1 This function accepts the user from step 2 as a parameter
  console.log('serialize', user);
  // 3.2 When 'done' is invoked, the information passed in is set on the cookie
  done(null, user.id);
})

// 5. Deserialize (fires when any endpoints are hit)
passport.deserializeUser((id, done) => {
  // 5.1 This function accepts whatever was set on the cookie from step 3 as a parameter
  console.log('deserialize', id);
  server.get('db').read_user(id).then(user => {
    // 5.2 When 'done' is invoked, the information passed in is available on the session, as req.user
    done(null, user);
  })
})

// 1. Entry point. Front end hits this endpoint
server.get('/auth', passport.authenticate('auth0', {
  // 4. Endpoint uses these redirect options to navigate the user back to the front after the Auth0 process is complete
  successRedirect: 'http://localhost:3000/#/dashboard',
  failureRedirect: 'http://localhost:3000/#/'
}))

// 6. Example of endpoint being hit after authentication
server.get('/auth/user', (req, res) => {
  // 6.1 User information is indeed available on session as req.user after passing through the deserialize method
  if (req.user) {
    res.status(200).send(req.user);

  } else {
    res.sendStatus(403);
  }
})

// 7. Logout
server.get('/auth/logout', (req, res) => {
  // 7.1 First we destroy our server's session
  req.session.destroy();
  // 7.2 Then we direct the user to Auth0 to destroy the Auth0 session
  // 7.3 The returnTo query included in the string below determines where the user will be redirected to after destroying the Auth0 session
  res.redirect(`https://bethebert.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost:3000&client_id=${process.env.CLIENT_ID}`)
})

server.listen(PORT, _ => console.log(`Housten we have lift off on port ${PORT}`));