var kaltura = require("kaltura-client");
var express = require("express");
var R = require("ramda");
var router = express.Router();
var KalturaClientFactory = require("../lib/kalturaClientFactory");

function getPlaylists(client) {
    return new Promise((resolve, reject) => {
        let filter = new kaltura.objects.PlaylistFilter();
        filter.orderBy = kaltura.enums.PlaylistOrderBy.CREATED_AT_ASC;
        let pager = new kaltura.objects.FilterPager();
        pager.pageSize = 500;
        kaltura.services.playlist
            .listAction(filter, pager)
            .execute(client)
            .then(response => {
                resolve(response);
            });
    });
}

router.get("/", async (req, res, next) => {
    var ks = await KalturaClientFactory.getKS("", { type: kaltura.enums.SessionType.ADMIN });
    var client = await KalturaClientFactory.getClient(ks);
    var playlists = await getPlaylists(client);
    playlists = playlists.objects.filter(playlist => playlist.playlistContent);
    playlists = R.uniqWith((a, b) => {
        return a.userId === b.userId;
    }, playlists);
    res.render("gallery", { playlists });
});

module.exports = router;
