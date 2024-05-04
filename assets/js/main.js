import { exampleText } from '../data/exampleData.js'
import { API_URL } from './config.js'

const MAXWORDCOUNT = 1500

$().ready(function () {
    $('#input-form').validate({
        rules: {
            payload: {
                required: true,
                minlength: 50,
            }
        },
        messages: {
            payload: {
                required: 'Please enter some text',
                minlength: 'Please enter at least 50 characters',
            }
        },
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        highlight: function (element, errorClass) {
            $(element).addClass(errorClass);
        },
        unhighlight: function (element, errorClass) {
            $(element).removeClass(errorClass);
        },
        focusInvalid: false,
        errorClass: 'error',
        invalidHandler: function (event, validator) {
            if (validator.numberOfInvalids() > 0) {
                $('#summarize-button').prop('disabled', true)
            } else {
                $('#summarize-button').prop('disabled', false)
            }
            $('.error').fadeOut(function () {
                $(this).fadeIn();
            })
        },
        submitHandler: function (form) {
            const text = $('textarea[name="payload"]').val();
            const $button = $('#summarize-button')
            $button.prop('disabled', true)
            $button.text('Summarizing...');
            $('#result-text').removeAttr('placeholder');
            $('#result-text').val('');
            $('.loader').css('display', 'block')
            $.ajax({
                type: 'POST',
                url: `${API_URL}/summarize`,
                contentType: 'application/json',
                data: JSON.stringify({
                    payload: text,
                }),
                success: function (data) {
                    $('#result-text').val(data.processed_data);
                },
                complete: function () {
                    $button.prop('disabled', false)
                    $('.loader').css('display', 'none')
                    $('#result-text').attr('placeholder', 'AI Result')
                    $button.text('Summarize');
                }
            })
        }
    })
})

function validateInput() {
    let text = $('#input-text').val();
    if (text.length >= MAXWORDCOUNT) {
        $('#charCount').css('color', 'red')
        if (text.length > MAXWORDCOUNT) {
            $('#summarize-button').prop('disabled', true)
        }
    } else {
        $('#summarize-button').prop('disabled', false)
        $('#charCount').css('color', 'initial')
    }
}

function refreshCounter(initialCharCount = 0) {
    let newCharCount = $('#input-text').val().length
    const $wordCountText = $('#charCount')
    $({ currentValue: initialCharCount }).animate(
        { currentValue: newCharCount },
        {
            duration: 300,
            easing: "swing",
            step: function () {
                $wordCountText.text(Math.ceil(this.currentValue));
            },
            complete: function () {
                this.currentValue = newCharCount;
                $wordCountText.text(this.currentValue);
            }
        }
    )
    validateInput();
}
$('#clear-button').on('click', (event) => {
    event.preventDefault();
    let initialCharCount = $('#input-text').val().length
    $('#input-text').val('');
    $('#result-text').val('');
    refreshCounter(initialCharCount)
    $('#input-form').valid()
})

$('#example-text-button').on('click', (event) => {
    event.preventDefault()
    let initialCharCount = $('#input-text').val().length
    let randomData = exampleText[Math.floor(Math.random() * exampleText.length)]
    $('#input-text').val(randomData.text);
    refreshCounter(initialCharCount)
    $('#input-form').valid()
})

$('#copy-button').on('click', (event) => {
    event.preventDefault()
    let text = $('#result-text').val() + "abac";
    if(!text) return
    navigator.clipboard.writeText(text);
    const copiedTextToast = $('#copiedTextToast')
    const toast = bootstrap.Toast.getOrCreateInstance(copiedTextToast)
    toast.show()
})

$('#input-text').on('input', () => {
    let initialCharCount = $('#input-text').val().length
    if ($('#input-text').val().length > MAXWORDCOUNT) {
        $('#input-text').val($('#input-text').val().substring(0, MAXWORDCOUNT));
    }
    refreshCounter(initialCharCount)
})