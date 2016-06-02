module.exports = function(Model, options) {
  'use strict';

  var loopback = require('loopback');

  function auditAction(operation, ctx) {
    // Get the current access token
    var loopbackContext = loopback.getCurrentContext();
    if (loopbackContext) {
      var user = loopbackContext.get('currentUser');
      var remoteAddress = loopbackContext.get('remoteAddress');
      var xForwardedFor = loopbackContext.get('xForwardedFor');

      // console.log("Context: " + JSON.stringify(loopbackContext));

      if (typeof user != "undefined") {
        Model.getApp(function(err, app) {
          if (err) {
            console.log("error: " + JSON.stringify(err));
            return;
          }

          var instance = ctx.instance;
          // if the instance is a user model 
          // delete the confirm password for new instances
          if (ctx.Model.modelName === "user" &&
            typeof instance != "undefined" &&
            typeof instance.confirmPassword != "undefined") {
            delete instance.confirmPassword;
          }

          var AuditLog = app.models.AuditLog;
          AuditLog.create({
            model: ctx.Model.modelName,
            operation: operation,
            userId: user.id,
            remoteAddress: remoteAddress,
            xForwardedFor: xForwardedFor,
            where: JSON.stringify(ctx.where),
            data: JSON.stringify(ctx.data),
            currentInstance: JSON.stringify(ctx.currentInstance),
            instance: JSON.stringify(instance)
          }, function(err, logs) {
            if (err) {
              console.log("error: " + JSON.stringify(err));
              return;
            }
          });
        });
      }
    }
  }

  Model.observe('before save', function event(ctx, next) {
    if (typeof options.saveAction === 'undefined' ||
      options.saveAction === true) {
      auditAction('before save', ctx);
    }
    next();
  });

  Model.observe('before delete', function event(ctx, next) {
    if (typeof options === 'undefined' ||
      options.deleteAction === true) {
      auditAction('before delete', ctx);
    }
    next();
  });

  Model.observe('access', function event(ctx, next) {
    // generate lot of records so default is false
    // you have to explicit set it to true
    if (typeof options.accessAction != 'undefined' &&
      options.accessAction === true) {
      auditAction('access', ctx);
    }
    next();
  });
};