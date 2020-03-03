require('dotenv').config()

const express = require('express');
const socketIO = require('socket.io');
const path = require("path");
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

const app = express();
const samlStrategy = new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: 'https://shib-test.bu.edu/idp/profile/SAML2/Redirect/SSO',
    issuer: 'http://upe-interview.bu.edu/bushibboleth/sp',
    identifierFormat: null,
    decryptionPvk: fs.readFileSync(path.join(__dirname, '/cert/key.pem'), 'utf8'),
    privateCert: fs.readFileSync(path.join(__dirname, '/cert/key.pem'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, '/cert/cert_idp.pem'), 'utf8'),
    validateInResponseTo: false,
    disableRequestedAuthnContext: true
  },
  (profile, done) => {
    findByEmail(profile.email, function(err, user) {
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(samlStrategy);
app.use(express.static(path.join(__dirname, '../build')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'testtest',
  resave: true,
  saveUninitialized: true
}));

app.get('/login',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/secret');
  }
);

app.post('/login/callback',
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/secret');
  }
);

app.get('/secret',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    res.send(`hi there ${req.user}`);
  }
);

app.get('/shibboleth/metadata',
  function(req, res) {
    res.type('application/xml');
    const cert = fs.readFileSync(path.join(__dirname, '/cert/cert.pem'), 'utf8');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata(cert, cert));
  }
);

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));

const serverPort = process.env.PORT || 3030;
const server = app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));

const io = socketIO(server);
io.on('connection', (client) => {
  client.on('joinInterview', interviewId => {
    client.join(interviewId);
    client.emit('joinConfirmation', `you've joined room ${interviewId}`)
    client.broadcast.to(interviewId).emit('joinNotification', `client: ${client.id} has joined room ${interviewId}`);
  });

  client.on('problemChange', ({ interviewId, problemKey }) =>
    client.broadcast.to(interviewId).emit('problemChange', problemKey));

  client.on('interviewClosed', interviewId =>
    client.broadcast.to(interviewId).emit('interviewClosed', true));
});
