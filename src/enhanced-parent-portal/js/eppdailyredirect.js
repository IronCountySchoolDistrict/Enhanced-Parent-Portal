// TODO: yeah...this script could use some work.
var newdate = new Date();
if (newdate.getHours() > 5) {
    newdate.setDate(newdate.getDate() + 1);
}
//You can change what time the cookie defaults to expire by changing 5 to another number 1-24.
newdate.setHours(5);
newdate.setMinutes(0);
newdate.setSeconds(0);//Use the same number you used above to replace the 5 in this line as well.

var guardianVisits = GetCookie("guardianVisits~(curschoolid)");
if (!guardianVisits) {
    guardianVisits = 0;
}
guardianVisits++;

SetCookie("guardianVisits~(curschoolid)", guardianVisits, newdate, "/", null, false);
if (guardianVisits == 1) {
    if (guardianFirstScreen !== '') {
        location.href = guardianFirstScreen;
    }
}
/*
 * Set cookie function
 */
function SetCookie(name, value) {
    var argv = SetCookie.arguments;
    var argc = SetCookie.arguments.length;
    var expires = (2 < argc) ? argv[2] : null;
    var path = (3 < argc) ? argv[3] : null;
    var domain = (4 < argc) ? argv[4] : null;
    var secure = (5 < argc) ? argv[5] : false;
    document.cookie = name + "=" + escape(value) +
        ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
        ((path == null) ? "" : ("; path=" + path)) +
        ((domain == null) ? "" : ("; domain=" + domain)) +
        ((secure == true) ? "; secure" : "");
}

/*
 * Get cookie function
 */
function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1)
        endstr = document.cookie.length;
    return unescape(document.cookie.substring(offset, endstr));
}
function GetCookie(name) {

    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return getCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0)
            break;
    }
    return null;
}

function getCookie(name) {
    var dc = document.cookie;
    //alert("cookie=" + dc);
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) end = dc.length;
    var retval = unescape(dc.substring(begin + prefix.length, end));
    //alert("retval=" + retval);
    return retval;
}

function deleteCookie(name) {
    if (getCookie(name)) {
        document.cookie = "psaid=<-A-><-E->; expires=Thu, 01-Jan-70 00:00:00 GMT";
        //alert("deleted cookie=" + document.cookie);
    }
}