function save_options() {
    var height = $('#height').val();
    var width = $('#width').val();
    chrome.storage.sync.set({
        height: height,
        width: width,
    }, function() {
    // Update status to let user know options were saved.
    $('#status').text(chrome.i18n.getMessage("saved"));
    setTimeout(function(){$('#status').text("")},3000)
    });
}

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({height: 5,width: 60,time: 3000}, function(items) {
    $('#height').val(items.height);
    $('#width').val(items.width);
    });
}

$(function(){
    restore_options();
    $('#save').on('click', save_options);
    $('title').text(chrome.i18n.getMessage("option_title"));
    $('#label-size').text(chrome.i18n.getMessage("option_size"));
    $('#save').text(chrome.i18n.getMessage("save"));
});
