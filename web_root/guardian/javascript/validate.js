window.ParsleyValidator
    .addValidator('phonenum', function (value) {
        var pattern = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
        return pattern.test(value);
    }, 60)
    .addMessage('en', 'phonenum', 'This field must match the form: ###-###-####.');

window.ParsleyValidator
    .addValidator('danglingspaces', function (value) {
        // any string that doesn't start with a space, but can contain spaces elsewhere
        var pattern = /^(?!\s)(.*)$/;
        var noBeginSpace = pattern.test(value);
        // Check if the last character is a space character.
        var noEndSpace = value.charAt(value.length - 1) !== ' ';
        return noBeginSpace && noEndSpace;
    }, 65)
    .addMessage('en', 'danglingspaces', 'This field cannot start or end with a space');

$(function() {
    $('#demographic-update-form').parsley({
        classHandler: function (ParsleyField) {
            return ParsleyField.$element;
        },
        errorsContainer: function (fieldInstance) {
            return fieldInstance.$element.closest('.field-container');
        },
        // bootstrap form classes
        successClass: 'has-success has-feedback',
        errorClass: 'hasHadError error',
        errorsWrapper: '<p class=\"error-message\"></p>',
        errorTemplate: '<span></span>',
        excluded: ':hidden'
    }).subscribe('parsley:field:error', function (ParsleyField) {
        var errorWrapper = ParsleyField.$element.siblings('.error-message');
        errorWrapper.css({'display': 'block'});
    }).subscribe('parsley:field:success', function (ParsleyField) {
        var errorWrapper = ParsleyField.$element.siblings('.error-message');
        errorWrapper.css({'display': 'none'});
    });
});
