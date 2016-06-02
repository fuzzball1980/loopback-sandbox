module.exports = function(app) {                                                              
   app.models.ACL.mixin('Audit');
   app.models.RoleMapping.mixin('Audit');
   app.models.Role.mixin('Audit');
   // app.models.AuthProvider.mixin('Audit');
};