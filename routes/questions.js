var express = require('express');
var router = express.Router();
let questionsData = require('./questions-data');
var KalturaClientFactory = require('../lib/kalturaClientFactory');
var kaltura = require('kaltura-client');

function createPlaylist(client, name) {
  return new Promise((resolve, reject) => {
    /*
      Task 3
      ======
      create a new playlist

      Information:
      ------
      available arguments: name
      for success: resolve response
      for not success: reject response

      Hint:
      -----
      you should create playlist with type kaltura.enums.PlaylistType.STATIC_LIST
     */
    let playlist = new kaltura.objects.Playlist();
    playlist.name = name;
    playlist.playlistType = kaltura.enums.PlaylistType.STATIC_LIST;
    let updateStats = false;

    kaltura.services.playlist.add(playlist, updateStats)
      .execute(client)
      .then(response => {
        resolve(response);
      });
  });
}


function getPlaylist(client, playlistId) {
  return new Promise((resolve, reject) => {
    /*
      Task 4.1
      ======
      get the playlist

      Information:
      ------
      available arguments: id
      for success: resolve response
      for not success: reject response
     */
    let id = playlistId;
    kaltura.services.playlist.get(id)
      .execute(client)
      .then(response => {
        resolve(response);
      });
  });
}

function addEntryToPlaylist(client, playlist, entryId) {
  return new Promise((resolve, reject) => {
    let id = playlist.id;

    /*
      Task 4.2
      ======
      add the entry to the playlist

      Information:
      ------
      available arguments: id, entryId
      for success: resolve response
      for not success: reject response

      Hint:
      ------
      to set playlistContent property in the request, you should concat the new entry with comma separation.
      meaning, if the playlist contains entries, concat the new entry; otherwise add the entry id as is
     */

    let updatedPlaylist = new kaltura.objects.Playlist();
    updatedPlaylist.playlistContent = (playlist.playlistContent ? playlist.playlistContent + ',' : '') + entryId;
    kaltura.services.playlist.update(id, updatedPlaylist)
      .execute(client)
      .then(response => {
        resolve(response);
      });
  });
}



router.get('/', async (req, res, next) => {
  const currentQuestion = req.session.questionIndex || 0;
  const {id, content} = questionsData[currentQuestion];
  const {ks} = req.session;
  const {PLAYER_ID: playerId , PARTNER_ID: partnerId} = process.env;

  if (currentQuestion === 0) {
    var userClient = await KalturaClientFactory.getClient(ks);
    var playList = await createPlaylist(userClient, req.session.agentName);
    console.log(`created new playlist with id ${playList.id}`);
    req.session.playlistId = playList.id;
  }


  res.render('questions', { questionId : id, questionContent: content,  ks,
    playerId,
    partnerId});
});

router.post('/', async (req, res, next) =>{
  const questionId = Number.parseInt(req.body.questionId);
  const questionIndex =  questionsData.findIndex(question => question.id === questionId);
  const {entryId} = req.body;
  const {playlistId, ks} = req.session;

  var client = await KalturaClientFactory.getClient(ks);
  var playList = await getPlaylist(client, playlistId);
  var result = await addEntryToPlaylist(client, playList, entryId);

  const nextQuestionIndex = questionIndex+1;
  if (questionsData.length <= nextQuestionIndex) {
    req.session.questionIndex = 0;
    res.redirect('/summary');
    return;
  }

  req.session.questionIndex = nextQuestionIndex;
  res.redirect('/questions');
});

module.exports = router;
