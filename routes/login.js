var express = require('express');
var router = express.Router();
var kaltura = require('kaltura-client');
var express = require('express');
var router = express.Router();
var KalturaClientFactory = require('../lib/kalturaClientFactory');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session = null;
  res.render('login', { errorMessage: ''});
});

function getUser(client,userId) {
  return new Promise((resolve, reject) => {
    /*
      Task 2.1
      ======
      get user information from server if user exists

      Information:
      ------
      available arguments: userId
      for success: resolve null
      for not success: resolve response
     */
    reject({message: 'pending implementation (Task 2.1)'});

  });
}

function createUser(client, name, userId) {
  return new Promise((resolve, reject) => {
    /*
      Task 2.2
      ======
      create a new user

      Information:
      ------
      available arguments: name, userId
      for success: resolve response
      for not success: reject response
     */
    reject({message: 'pending implementation (Task 2.2)'});
  });
}

function getOrCreateUser(client, name, email) {
  return getUser(client, email).then((user) => {
    if (user) {
      return user;
    } else {
      return createUser(client, name, email).then((user) => {
        if (user) {
          return user;
        }
      });
    }
  })
}

/* POST users listing. */
router.post('/', async (req, res, next) => {
  if (!req.body.name || !req.body.email) {
    res.render('login', { errorMessage: 'Please provide name and valid email address'});
    return;
  }

  try {
    var ks = await KalturaClientFactory.getKS('', {type: kaltura.enums.SessionType.ADMIN});
    var client = await KalturaClientFactory.getClient(ks);
    var user = await getOrCreateUser(client, req.body.name, req.body.email);
    var userKs = await KalturaClientFactory.getKS(user.id, {privileges: 'editadmintags:*'});

    req.session.ks = userKs;
    req.session.agentName = req.body.name;
    res.redirect(`/questions`);
  }catch (e) {
    res.render('login', { errorMessage: e.message});
  }
});

module.exports = router;
