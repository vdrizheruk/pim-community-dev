define(
    ['jquery', 'underscore', 'oro/navigation', 'backbone/bootstrap-modal'],
    function ($, _, Navigation) {
        'use strict';

        /**
         * Dialog class purposes an easier way to call ModalDialog components
         *
         * @author    Romain Monceau <romain@akeneo.com>
         * @copyright 2013 Akeneo SAS (http://www.akeneo.com)
         * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
         *
         * @uses Backbone.BootstrapModal
         *
         * Example:
         *      Dialog.alert('{{ 'MyMessage'|trans }}', 'MyTitle');
         */
        return {
            /**
             * Open a modal dialog without cancel button
             * @param string content
             * @param string title
             */
            alert: function (content, title) {
                if (!_.isUndefined(Backbone.BootstrapModal)) {
                    var alert = new Backbone.BootstrapModal({
                        allowCancel: false,
                        title: title,
                        content: content
                    });
                    alert.open();
                } else {
                    window.alert(content);
                }
            },

            /**
             * Open a modal dialog with cancel button and specific redirection when
             * @param string content
             * @param string title
             * @param string okText
             * @param string location
             */
            redirect: function (content, title, okText, location) {
                if (!_.isUndefined(Backbone.BootstrapModal)) {
                    var redirectModal = new Backbone.BootstrapModal({
                        allowCancel: true,
                        title: title,
                        content: content,
                        okText: okText
                    });

                    redirectModal.on('ok', function() {
                        Navigation.getInstance().setLocation(location);
                    });

                    $('.modal-body a', redirectModal.el).on('click', function() {
                        redirectModal.close();
                    });

                    redirectModal.open();
                } else {
                    window.alert(content);
                }
            },

            /**
             * Open a confirm modal dialog to validate the action made by user
             * If user validate its action, a js callback function is called
             * @param string content
             * @param string title
             * @param function callback
             */
            confirm: function (content, title, callback) {
                if (!_.isUndefined(Backbone.BootstrapModal)) {
                    var confirm = new Backbone.BootstrapModal({
                        title: title,
                        content: content
                    });
                    confirm.on('ok', callback);
                    confirm.open();
                } else if (window.confirm(content)) {
                    callback();
                }
            }
        };
    }
);
