'use strict';

module.exports = function(server) {
    server.dataSources.localStorage.connector.allowedContentTypes = ["application/pdf", "text/plain"];
}