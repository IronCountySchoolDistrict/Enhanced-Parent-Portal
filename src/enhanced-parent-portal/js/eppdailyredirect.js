require.config({
    paths: {
        jscookie: "https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.0.1/js.cookie.min"
    }
});

require(["jquery", "jscookie"], function($, Cookies) {
    $.getJSON("/guardian/data/getCurrentSchool.json.html", function(currentSchool) {
        var newdate = new Date();
        if (newdate.getHours() > 5) {
            newdate.setDate(newdate.getDate() + 1);
        }
        //You can change what time the cookie defaults to expire by changing 5 to another number 1-24.
        newdate.setHours(5);
        newdate.setMinutes(0);
        newdate.setSeconds(0);//Use the same number you used above to replace the 5 in this line as well.

        var guardianVisits = Cookies.get("guardianVisits" + currentSchool.id);
        if (!guardianVisits) {
            guardianVisits = 0;
        }
        guardianVisits++;

        Cookies.set("guardianVisits" + currentSchool.id, guardianVisits, {expires: newdate, path: "/"});
        if (guardianVisits == 1) {
            if (guardianFirstScreen !== '') {
                location.href = guardianFirstScreen;
            }
        }
    });
});

