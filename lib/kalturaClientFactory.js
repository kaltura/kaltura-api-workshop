const kaltura = require('kaltura-client');

const {ADMIN_SECRET: secret, PARTNER_ID: partnerId, KS_TYPE: ksType} = process.env;
let config = new kaltura.Configuration();
config.serviceUrl = "http://www.kaltura.com";

const defaultKSType = kaltura.enums.SessionType[ksType || 'USER'];

class KalturaClientFactory {
    static getKS(userId, options = null) {
        const { type = defaultKSType, privileges = ''} = options || {};
        var client = new kaltura.Client(config);
        var expiry = null;

        return new Promise((resolve, reject) => {
            /*
            Task 1
            ======
            create Kaltura session, which allows access to the Kaltura api.

            Information:
            ------
            available arguments: secret, userId, type, partnerId, expiry, privileges
            for success: ks as a string
            for not success: response.message

            Examples:
            --------
            To continue with valid information, do the following:
            resolve(....value....)

            To notify a problem, do the following:
            reject(....value....)
             */
          kaltura.services.session.start(secret, userId, type, partnerId, expiry, privileges)
            .completion((success, response) => {
              if (!success) {
                console.log('Session initiation Failed.');
                reject(response.message);
                return;
              }
              resolve(response);
            })
            .execute(client);
        });
    }

    static getClient(ks) {
        var client = new kaltura.Client(config);
        client.setKs(ks);
        return Promise.resolve(client);
    }
}

module.exports = KalturaClientFactory;
