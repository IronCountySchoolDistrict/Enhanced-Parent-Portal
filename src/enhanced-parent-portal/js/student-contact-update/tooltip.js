/*global define*/
define(function () {
    'use strict';
    return {
        main: function () {
            this.bindToolTip();
        },

        bindToolTip: function () {
            $j(document).tooltip();
        }
    };
});