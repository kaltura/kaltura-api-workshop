var kaltura = require('kaltura-client');
var express = require('express');
var router = express.Router();
var KalturaClientFactory = require('../lib/kalturaClientFactory');

function getPlaylists(client) {
    return new Promise((resolve, reject) => {
      /*
        Task 6
        ======
        get all playlists

        Information:
        ------
        available arguments:
        for success: resolve response
        for not success: reject response
       */
        reject('pending implementation');
    });
}

router.get('/', async (req, res, next) => {
    var ks = await KalturaClientFactory.getKS('', {type: kaltura.enums.SessionType.ADMIN});
    var client = await KalturaClientFactory.getClient(ks);
    var playlists = await getPlaylists(client);
    res.render('recruiter', {playlists});
});

module.exports = router;
