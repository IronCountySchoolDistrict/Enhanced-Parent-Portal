/*global $j,_,require,console*/
require(['underscore'], function() {
    'use strict';
    var psData;
    psData = $j.parseJSON($j('#ps-data').data().ps);
    console.dir(psData);
});