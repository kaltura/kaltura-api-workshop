var express = require('express');
var router = express.Router();
var kaltura = require('kaltura-client');
var KalturaClientFactory = require('../lib/kalturaClientFactory');


function getPlaylist(client, id) {
    return new Promise((resolve, reject) => {
        let version = -1;

      /*
       Task 5.1
       ======
       get the playlist

       Information:
       ------
       available arguments: id, version
       for success: resolve response
       for not success: reject response
      */

        kaltura.services.playlist.get(id, version)
            .execute(client)
            .then(response => {
                resolve(response);
            }).catch(e => {
                reject(e);
        });
    });
}


function getEntriesStatus(client, entryList) {
  return new Promise((resolve, reject) => {
    /*
    Task 5.2
    ======
    get playlist entries status

    Information:
    ------
    available arguments: entryList, version
    for success: resolve response
    for not success: reject response

    Hints:
    ------
    desired statusIn values:
      kaltura.enums.EntryStatus.READY
      kaltura.enums.EntryStatus.PENDING
      kaltura.enums.EntryStatus.PRECONVERT
   */
    let filter = new kaltura.objects.BaseEntryFilter();
    filter.idIn = entryList;
    filter.statusIn = [
      kaltura.enums.EntryStatus.READY,
      kaltura.enums.EntryStatus.PENDING,
      kaltura.enums.EntryStatus.PRECONVERT
    ].join(',');
    let pager = new kaltura.objects.FilterPager();

    kaltura.services.baseEntry.listAction(filter, pager)
      .execute(client)
      .then(response => {
        resolve(response);
      }).catch(e => {
      reject(e)
    });
  })
}


function executePlaylist(client, id) {
    return new Promise((resolve, reject) => {
        let detailed = "";
        let playlistContext = null;
        /*
        Task 5.3
        ======
        get the playlist

        Information:
        ------
        available arguments: id, detailed, playlistContext
        for success: resolve response
        for not success: reject response
       */
        let filter = new kaltura.objects.MediaEntryFilterForPlaylist();
        let pager = new kaltura.objects.FilterPager();
        kaltura.services.playlist.execute(id, detailed, playlistContext, filter, pager)
            .execute(client)
            .then(response => {
                resolve(response);
            }).catch(e => {
                reject(e)
            });
    });
}

router.get('/', async function(req, res, next) {
    let questions = [];
    let ks = req.session.ks;
    let referrer = req.get('Referrer') || '';
    let goBack =
        (referrer.includes("recruiter") || referrer.includes("gallery")) &&
        req.query.playlistId != null;
    let playlistId = req.query.playlistId || req.session.playlistId;
    if (ks && playlistId) {

        let client = await KalturaClientFactory.getClient(ks);
        let playlist;
        try {
            //Check if all entries have finished processing
            let playlistData = await getPlaylist(client, playlistId);
            let entryList = await getEntriesStatus(client, playlistData.playlistContent);
            if ((entryList.totalCount === 0) ||
                (!entryList.objects.every(entry => entry.status.toString() === kaltura.enums.EntryStatus.READY))) {
                return res.render('summary', {
                    questions,
                    error: "Questions are being processed, please wait",
                    goBack
                });
            }
        } catch (e) {
            //Handle error playlist result request
            return res.render('summary', {
                questions,
                error: "API Error: " + JSON.stringify(e),
                goBack
            });
        }
        try {
            playlist = await executePlaylist(client, playlistId);
        } catch(e) {
            //Handle error playlist result request
            return res.render('summary', {
                questions,
                error: "API Error: " + JSON.stringify(e),
                goBack
            });
        }
        //Handle no entries in playlist
        if (playlist.length === 0) {
            return res.render('summary', {
                questions,
                error: "No answers found, please go back and add your answers",
                goBack
            });
        }
        playlist.forEach(entry => {
            questions.push({
                id: entry.id,
                name: entry.name,
                userName: entry.userId,
                createdAt: new Date(entry.createdAt * 1000),
                image: entry.thumbnailUrl,
                description: entry.description
            });
        });
        res.render('summary', {
            questions,
            error: null,
            goBack
        });
    } else {
        //handle error
        res.render('summary', {
            questions,
            error: null,
            goBack
        });
    }
});

module.exports = router;
