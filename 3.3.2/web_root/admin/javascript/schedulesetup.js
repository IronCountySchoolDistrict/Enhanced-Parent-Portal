/*global $j*/
var template = $j($j('#requests-template').html());
var select = $j(':input').eq(3).parent().parent();
template.insertAfter(select);