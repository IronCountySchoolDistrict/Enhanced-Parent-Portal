/*global $j*/
$j(function() {
    var template = $j($j('#enhancedpp-template').html());
    var select = $j('a[href*="misc-district.html"]');
    template.insertAfter(select);
});