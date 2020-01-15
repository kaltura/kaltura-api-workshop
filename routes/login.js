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
    kaltura.services.user.get(userId)
      .completion((success, response) => {
        if (!success) {
          console.log("User doesn't exist");
          resolve(null);
        } else {
          console.log("User Exists");
          resolve(response);
        }
      })
      .execute(client);
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

    let user = new kaltura.objects.User();
    user.firstName = name;
    user.id = userId;
    kaltura.services.user.add(user)
      .completion((success, response) => {
        if (success) {
          console.log("User Created");
          resolve(response);
        } else {
          console.log("Could not create user");
          reject(response.message);
        }
      })
      .execute(client)
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
