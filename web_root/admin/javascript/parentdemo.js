/* exported approveFieldChange */
function changeFieldValue(permField, tempField) {
    "use strict";
    document.forms[0].elements[permField].value = document.forms[0].elements[tempField].value;
}

function clearFieldValue(clearFieldName) {
    "use strict";
    document.forms[0].elements[clearFieldName].value = '';
}

function approveFieldChange(realField, parentField) {
    "use strict";
    if (document.forms[0].elements[parentField].value !== '') {
        changeFieldValue(realField, parentField);
        clearFieldValue(parentField);
    }
}