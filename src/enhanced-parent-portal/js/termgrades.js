/*global $j,_,require,parseInt,psData*/


// Check for the correct PS preferences for the current user to see historical grades.
if (!psData.historicalGrades ||
    (!(psData.guardianSSO) && !(psData.allowWebAccess))) {
    window.location.href = '/guardian/home_not_available.html';
    return;
}


/**
 * Creates an Array of Objects that follows the form:
 * { "courseName": "...",
 *   "courseGrades": [grade,percent,behavior,earnedCreditHours,]
 *     -- these four elements in the array are repeated for each store code shown in the column headers of the table.
 *     if no grade entry exists for a storecode, these four elements are blank strings.
 *     this enables the template that uses this json to just loop over the array to display grades json for every
 *     storecode displayed on the page.
 *
 * @param grades {Object} See psData.storedGrades.
 * @param storeCodes {Array} All storecodes that contain grade entries. (see RemoveBlankTrimesterGrades)
 * @returns {Array}
 */
function normalizeGrades(grades, storeCodes) {
    'use strict';
    var courseNames = getAllCourseNames(grades);
    var normalGrades = [];
    _.each(courseNames, function (course) {
        var tempObj = {};
        var courseGrades = getAllCourseGrades(course);
        tempObj.courseName = courseGrades[0].courseName;
        tempObj.courseGrades = [];
        _.each(storeCodes, function (code) {

            // filter returns an array of matches. Since there is only one grades entry per store code,
            // there will only be one result for each filter call
            var courseMatchingStoreCode = courseGrades.filter(function (obj) {
                return obj.storecode === code;
            });

            if (courseMatchingStoreCode.length !== 0) {
                tempObj.courseGrades.push(courseMatchingStoreCode[0].grade);

                // If a histYearId was passsed in through a gpv, use it.
                // TODO: Refactor this to use a template for the link.
                if (psData.histYearId) {
                    tempObj.courseGrades.push('<a href="tgscores.html?frn=031' + courseMatchingStoreCode[0].dcid + '&histyearid=' + psData.histYearId + '&fg=' + courseMatchingStoreCode[0].storecode + '">' + courseMatchingStoreCode[0].percent + '</a>');

                    // No histYearId was passed in through gpv, so use the maxYearId
                    // that the student has storedgrades entries for.
                } else {
                    tempObj.courseGrades.push('<a href="tgscores.html?frn=031' + courseMatchingStoreCode[0].dcid + '&histyearid=' + psData.maxYearId + '&fg=' + courseMatchingStoreCode[0].storecode + '">' + courseMatchingStoreCode[0].percent + '</a>');
                }

                tempObj.courseGrades.push(courseMatchingStoreCode[0].behavior);
                tempObj.courseGrades.push(courseMatchingStoreCode[0].earnedCreditHours);
            } else {
                tempObj.courseGrades.push('');
                tempObj.courseGrades.push('');
                tempObj.courseGrades.push('');
                tempObj.courseGrades.push('');
            }


        });
        normalGrades.push(tempObj);
    });
    return normalGrades;
}

/**
 * The PS database stores trimester entries with all null values that don't need to be displayed.
 * This function looks at psData.storedGrades and removes any grade entries that fall under a
 * trimester storecode and don't have any non-null grade json for that course.
 *
 * @param grades {Object} See psData.storedGrades
 */
function removeBlankTrimesterGrades(grades) {
    'use strict';
    var trimesterCodes = ['T1', 'T2', 'T3'];
    var containsTrimesterCodes = false;
    var trimesterCodeGrades = grades.filter(function (obj) {
        return trimesterCodes.indexOf(obj.storecode) !== -1;
    });
    if (trimesterCodeGrades.length !== 0) {
        containsTrimesterCodes = true;
    }
    var nonZeroTrimesterGrades = grades.filter(function (obj) {
        return (
            trimesterCodes.indexOf(obj.storecode) !== -1 &&
                obj.earnedCreditHours !== '0'
        );
    });
    if (nonZeroTrimesterGrades.length === 0 && containsTrimesterCodes) {
        psData.storeCodes.splice(psData.storeCodes.indexOf('T1'), 1);
        psData.storeCodes.splice(psData.storeCodes.indexOf('T2'), 1);
        psData.storeCodes.splice(psData.storeCodes.indexOf('T3'), 1);
    }
}

/**
 * Returns all grade entries with a course name that matches courseName.
 *
 * @param courseName {string} Name of the course (DB column is COURSE_NAME)
 * @returns {Array}
 */
function getAllCourseGrades(courseName) {
    'use strict';
    return psData.storedGrades.filter(function (obj) {
        return obj.courseName === courseName;
    });
}

/**
 * Retuns all (unique) course names in Array of grade objects.
 *
 * @param grades {Object} See psData.storedGrades
 * @returns {Array}
 */
function getAllCourseNames(grades) {
    'use strict';
    return _.chain(grades)
        .map(function (grade) {
            return grade.courseName;
        })
        .uniq()
        .value();
}

/**
 * Create an Array of Objects that contains json for each year tab.
 * The object follows the format:
 *  {
 *      "label": the text between the open/close a tag.
 *      "liClass": value of the class of the li tab element.
 *        Setting the class to "selected" means the tab is displayed as selected.
 *      "href": tab link.
 *  }
 *
 * @return {Array}
 */
function createYearTabsContext() {
    'use strict';
    var yearTabsContext = [];
    _.each(psData.yearIDs, function (year, index) {
        var label,
            intYear,
            tempObj = {};
        intYear = parseInt(year, 10);
        label = (1990 + intYear).toString() + '-' + (1991 + intYear).toString();
        tempObj.label = label;

        // This is the first stored grades year, and no histYearId variable was passed in,
        // so make this year the selected year.
        if (index === 0 && psData.histYearId === null) {
            tempObj.liClass = 'selected';
            tempObj.href = '#';

            // histYearId gpv was passed in and matches the year variable.
        } else if (year === psData.histYearId) {
            tempObj.liClass = 'selected';
            tempObj.href = '#';

            // else, this is is not the selected year.
        } else {
            tempObj.liClass = '';
            tempObj.href = 'termgrades.html?histyearid=' + year;
        }
        yearTabsContext.push(tempObj);
    });
    return yearTabsContext;
}

require(['underscore'], function () {
    'use strict';

    removeBlankTrimesterGrades(psData.storedGrades, psData);



    // Version template insertion logic.
    var verTemplate = $j($j('#version-template').html());
    var verSelect = $j('activeNav');
    verTemplate.insertAfter(verSelect);

    // Remove original content
    $j('table').remove();

    // Year tabs insertion logic.
    var yearTabsContext = createYearTabsContext(psData);
    var yearTabsTemplate = $j('#year-tabs-template').html();
    var renderedYearTabsTemplate = _.template(yearTabsTemplate, {'yearTabs': yearTabsContext});
    var yearTabsSelect = $j('h1');
    $j(renderedYearTabsTemplate).insertAfter(yearTabsSelect);

    // Grades table insertion logic
    var normalGrades = normalizeGrades(psData.storedGrades, psData.storeCodes, psData);
    var gradesContext = {
        'courseGrades': normalGrades,
        'storeCodes': psData.storeCodes
    };
    var gradesTemplate = $j('#grades-template').html();
    var renderedGradesTemplate = _.template(gradesTemplate, gradesContext);
    $j(renderedGradesTemplate).insertAfter($j('#years-nav-secondary'));

    // Set row coloring by adding oddRow class.
    $j('table tr:even').not(':eq(0)').attr('class', 'oddRow');

    //$j('#nav-secondary').remove();

    // If there are no year tabs in the years-nav-secondary ul tag, no term grades are available for this student.
    // So, remove the table and display an error message.
    if ($j('#years-nav-secondary').children().length === 0) {
        $j('table').remove();
        $j('h1').remove();
        var errorTemplate = $j($j('#no-grades-template').html());
        var errorSelect = $j('#years-nav-secondary');
        errorTemplate.insertAfter(errorSelect);
    }
});