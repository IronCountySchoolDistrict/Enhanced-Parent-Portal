<!--
function changeFieldValue (permField, tempField){
	document.forms[0].elements[permField].value = document.forms[0].elements[tempField].value;
	return;
}

function clearFieldValue (clearFieldName){
	document.forms[0].elements[clearFieldName].value='';
	return;
}

function approveFieldChange (realField, parentField) {
	if (document.forms[0].elements[parentField].value !== ''){
	changeFieldValue(realField, parentField);
	clearFieldValue(parentField);
	}
}
//-->
