module.exports = function(User) {

    var loopback = require('loopback');
    var app = require('../../server/server');
    var Promise = require('bluebird');

    User.observe('before save', function(ctx, next) {
        // Validate if user has role admin if not don't allow to modify the roles and kiosks
        // al parecer esto es al pedo porque loopback no guarda las relaciones
        // hay que hacer las modificaciones en updateUserAndRoles
        var loopbackContext = loopback.getCurrentContext();
        if (loopbackContext) {
            var user = loopbackContext.get('currentUser');
            // console.log('CurrentUserRoles: ' + JSON.stringify(user.roles()));

            if (typeof user != "undefined") {
                if (!user.roles().some(function(role) {
                        if (role.name == 'admin') {
                            return true;
                        } else {
                            return false;
                        }
                    })) {
                    if (ctx.instance) {
                        // instance
                        //console.log(JSON.stringify(ctx.instance));
                        delete ctx.instance.roles;
                        delete ctx.instance.kiosk;
                        //console.log(JSON.stringify(ctx.instance));
                    } else {
                        // data
                        //console.log(JSON.stringify(ctx.data));
                        delete ctx.data.roles;
                        delete ctx.data.kiosks;
                        //console.log(JSON.stringify(ctx.data));
                    }
                }
            }
        }
        next();
    });

    User.updateUserAndRoles = function(user, cb) {
        var RoleMapping = app.models.RoleMapping;
        var Role = app.models.Role;
        var error = new Error();
        error.statusCode = 500;
        error.message = "We have problems in our servers, try again later";
        error.stack = "Unknow Error";

        User.upsert(new User(user), function(err, instance) {
            if (err) {
                console.log('Error: ' + JSON.stringify(err));
                return cb(error);
            }

            var loopbackContext = loopback.getCurrentContext();
            if (loopbackContext) {
                var currentUser = loopbackContext.get('currentUser');

                if (typeof currentUser != "undefined") {
                    if (!currentUser.roles().some(function(role) {
                            if (role.name == 'admin') {
                                return true;
                            } else {
                                return false;
                            }
                        })) {
                        // if the user is non admin don't allow to change the roles
                        var result = {
                            status: 200,
                            message: 'The User was updated',
                            user: instance
                        }
                        return cb(null, result);
                    }
                }
            } else {
                return cb(error);
            }

            // console.log('Instance: ' + JSON.stringify(instance));
            // console.log('currentUser: ' + JSON.stringify(user));

            instance.roles.destroyAll(function(error) {
                if (error) {
                    return cb(error);
                } else {
                    if (user.roles.length > 0) {
                        for (var i = 0; i < user.roles.length; i++) {
                            //console.log('User: '  + i + ' ' + JSON.stringify(user));

                            // anonymous function to pass i as a value
                            // sin esto se rompe todo porque se modifica i dentro del findOne
                            // return cb debe hacerse en el ultimo loop 
                            (function(i) {
                                Role.findOne({
                                    where: {
                                        id: user.roles[i].id
                                    }
                                }, function(err, role) {
                                    if (err) {
                                        console.log('Error: ' + JSON.stringify(err));
                                        return cb(error);
                                    }

                                    RoleMapping.create({
                                        principalType: "USER",
                                        principalId: instance.id,
                                        roleId: role.id
                                    }, function(err, roleMapping) {
                                        if (err) {
                                            console.log('Error: ' + JSON.stringify(err));
                                            return cb(error);
                                        }

                                        if (i == user.roles.length - 1) {
                                            var result = {
                                                status: 200,
                                                message: 'The User was updated',
                                                user: instance
                                            }
                                            return cb(null, result);
                                        }
                                    });
                                });
                            })(i);
                        }
                    } else {
                        var result = {
                            status: 200,
                            message: 'The User was updated',
                            user: instance
                        }
                        cb(null, result);
                    }
                }
            });
        });
    }

    User.resetPassword = function(user, cb) {
        var error = new Error();
        error.statusCode = 500;
        error.message = "We have problems in our servers, try again later";
        error.stack = "Unknow Error";

        User.findById(user.id, function(err, instance) {

            if (err) {
                console.log('Error: ' + JSON.stringify(err));
                return cb(error);
            }

            var loopbackContext = loopback.getCurrentContext();
            if (loopbackContext) {
                var currentUser = loopbackContext.get('currentUser');

                if (typeof currentUser != "undefined") {
                    if (!currentUser.roles().some(function(role) {
                            if (role.name == 'admin') {
                                return true;
                            } else {
                                return false;
                            }
                        }) && currentUser.id != user.id) {
                        // if the user is non admin don't allow to change the roles
                        var result = {
                            status: 401,
                            message: 'No rigths to make changes'
                        }
                        return cb(null, result);
                    }

                    // change password here
                    instance.updateAttribute('password', user.password, function(err, updatedUser) {
                        if (err) {
                            console.log('Error: ' + JSON.stringify(err));
                            return cb(error);
                        }

                        var result = {
                            status: 200,
                            message: 'Password was updated'
                        }
                        return cb(null, result);
                    });
                } else {
                    var result = {
                        status: 200,
                        message: 'Nothing was changed updated',
                        user: instance
                    }
                    cb(null, result);
                }
            } else {
                var result = {
                    status: 200,
                    message: 'Nothing was changed updated',
                    user: instance
                }
                cb(null, result);
            }
        });
    }

    User.remoteMethod(
        'updateUserAndRoles', {
            accepts: [{
                arg: 'user',
                type: 'User',
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

    User.remoteMethod(
        'resetPassword', {
            accepts: [{
                arg: 'user',
                type: 'User',
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
