/*global $j*/
var headerTemplate = $j($j('#header-template').html());
var headerSelect = $j('h1');
headerTemplate.insertAfter(headerSelect);
headerSelect.remove();

var verTemplate = $j($j('#version-template').html());
var verSelect = $j('activeNav');
verTemplate.insertAfter(verSelect);