module.exports = function(ProcessMagazine) {

  var loopback = require('loopback');
  var app = require('../../server/server');

  ProcessMagazine.beforeRemote('**', function(ctx, instance, next) {
    // TODO: check issue https://github.com/strongloop/loopback/issues/2400
    console.log('Issue with relations in the body: ', JSON.stringify(ctx.req.body));

    next();
  });

  ProcessMagazine.getMagazineFileInfo = function(issue, cb) {
    var error = new Error();
    error.statusCode = 500;
    error.message = "We have problems in our servers, try again later";
    error.stack = "Unknow Error";

    // TODO: check issue https://github.com/strongloop/loopback/issues/2400
    console.log('Issue without relations: ' + JSON.stringify(issue));

    var retVal = {};
    cb(null, retVal);
  }

  ProcessMagazine.remoteMethod(
    'getMagazineFileInfo', {
      description: 'Get PDF File metadata from and uploaded issue.',
      accepts: [{
        arg: 'issue',
        type: 'Issue',
        description: 'Get Magazine PDF metadata',
        http: {
          source: 'body'
        },
        required: true
      }],
      returns: {
        arg: 'response',
        type: 'object'
      },
      http: {
        verb: 'post'
      }
    }
  );
};
