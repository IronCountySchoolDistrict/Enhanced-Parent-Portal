/*global $j*/
var template = $j($j('#enhancedpp-template').html());
var select = $j('tr:contains("Payment Methods")');
template.insertAfter(select);