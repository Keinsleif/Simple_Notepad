function save_options() {
    var height = $('#height').val();
    var width = $('#width').val();
    var tab_size = $('#tab_size').val();
    chrome.storage.local.set({
        height: height,
        width: width,
        tab_size: tab_size
    }, function () {
        $('#status').text(chrome.i18n.getMessage("saved"));
        setTimeout(function () { $('#status').text("") }, 3000)
    });
}

function restore_options() {
    chrome.storage.local.get({ height: 5, width: 64, tab_size: 4 }, function (items) {
        $('#height').val(items.height);
        $('#width').val(items.width);
        $('#tab_size').val(items.tab_size);
    });
}

$(function () {
    restore_options();
    $('#save').on('click', save_options);
    $('title').text(chrome.i18n.getMessage("option_title"));
    $('#label-size').text(chrome.i18n.getMessage("option_size"));
    $('#label-tab').text(chrome.i18n.getMessage("option_tab"))
    $('#save').text(chrome.i18n.getMessage("save"));
});
