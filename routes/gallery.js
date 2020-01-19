var kaltura = require("kaltura-client");
var express = require("express");
var R = require("ramda");
var router = express.Router();
var KalturaClientFactory = require("../lib/kalturaClientFactory");

function getPlaylists(client) {
    return new Promise((resolve, reject) => {
        let filter = new kaltura.objects.PlaylistFilter();
        filter.orderBy = kaltura.enums.PlaylistOrderBy.UPDATED_AT_ASC;
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
    var filterPlaylists = R.compose(
        R.uniqWith((a, b) => a.userId === b.userId),
        R.filter(R.prop("playlistContent"))
    );
    var playlists = filterPlaylists((await getPlaylists(client)).objects);
    res.render("gallery", { playlists });
});

module.exports = router;
