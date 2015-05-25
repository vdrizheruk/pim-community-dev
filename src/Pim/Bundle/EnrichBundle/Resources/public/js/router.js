'use strict';

define(function (require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Routing = require('routing');
    var LoadingMask = require('oro/loading-mask');
    var ControllerRegistry = require('pim/controller-registry');
    var currentController = null;

    Routing.match = function (url) {
        var routes = this.getRoutes().c;
        var route;

        if (url.indexOf('?') !== -1) {
            url = url.substring(0, url.indexOf('?'));
        }

        if (url.indexOf('#') === 0) {
            url = url.substring(1);
        }

        if (url.indexOf('#') !== -1) {
            url = url.substring(0, url.indexOf('#'));
        }

        if (url.indexOf('/') !== 0) {
            url = '/' + url;
        }

        url = url.replace(this.getBaseUrl(), '');

        var escape = function (value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        }

        for (var name in routes) {
            route = routes[name];
            var pattern = '';
            var variables = [];
            var matching = true;

            if (route.requirements._method &&
                -1 === route.requirements._method.indexOf('GET') &&
                -1 === route.requirements._method.indexOf('POST')) {
                continue;
            }

            route.tokens.forEach(function (token) {
                switch (token[0]) {
                    case 'text':
                        pattern = escape(token[1]) + pattern;
                        matching = matching && url.indexOf(token[1]) !== -1;
                        break;
                    case 'variable':
                        pattern = escape(token[1]) + '(' + token[2].replace('++', '+') + ')' + pattern;
                        variables.push(token[3]);
                        break;
                    default:
                        break;
                }
            });

            if (!matching) {
                continue;
            }

            var matches = url.match(new RegExp('^' + pattern + '$'));

            if (matches) {
                var params = {};
                variables.reverse();

                variables.forEach(function (variable, index) {
                    params[variable] = matches[index + 1];
                });

                return {
                    name: name,
                    route: route,
                    params: params
                };
            }
        }

        return false;
    }

    var Router = Backbone.Router.extend({
        DEFAULT_ROUTE: 'oro_default',
        routes: {
            '': 'dashboard',
            '*path': 'defaultRoute'
        },
        loadingMask: null,
        initialize: function () {
            this.loadingMask = new LoadingMask();
            this.loadingMask.render().$el.appendTo($('.hash-loading-mask'));
        },
        dashboard: function () {
            return this.defaultRoute(Routing.generate('pim_dashboard_index'));
        },
        defaultRoute: function (path) {
            if (path.indexOf('/') !== 0) {
                path = '/' + path;
            }
            var route = Routing.match(path);
            if (false === route) {
                return this.notFound();
            }
            if (this.DEFAULT_ROUTE === route.name) {
                return this.dashboard();
            }

            this.loadingMask.show();
            if (currentController) {
                currentController.remove();
            }
            this.trigger('route:' + route.name, route.params);
            this.trigger('route_start', route.name, route.params);
            this.trigger('route_start:' + route.name, route.params);

            ControllerRegistry.get(route.name).done(_.bind(function (Controller) {
                var $view = $('<div>', {'class': 'view'}).appendTo($('#container'));
                currentController = new Controller({ el: $view });
                currentController.renderRoute(route, path).done(_.bind(function () {
                    // temp
                    _.each($('a[href]'), function (link) {
                        var href = $(link).attr('href');
                        if (href.substring(0, 1) !== '#' && href.substring(0, 11) !== 'javascript:') {
                            href = '#' + href;
                        }
                        $(link).attr('href', href);
                    });
                    this.trigger('route_complete', route.name, route.params);
                    this.trigger('route_complete:' + route.name, route.params);

                }, this)).fail(this.notFound).always(_.bind(function() {
                    this.loadingMask.hide();
                }, this));
            }, this));
        },
        notFound: function () {
            $('#container').html('Whoops, no such page!');
        },
        hideLoadingMask: function () {
            this.loadingMask.hide();
        }
    });

    return new Router();
});
