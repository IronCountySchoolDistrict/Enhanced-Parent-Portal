/*global $j,_,require,console*/
require(['underscore'], function() {
    'use strict';
    var psData;
    psData = $j.parseJSON($j('#ps-json').data().ps);
    console.dir(psData);
});