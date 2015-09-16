/*global $j*/
(function() {
    'use strict';
    var verTemplate = $j($j('#version-template').html()),
        verSelect = $j('activeNav');
    verTemplate.insertAfter(verSelect);
}());