'use strict';
const RESERVED = ["slist", "memos", "selected", "simple_memo"]
var memos = { "sync": {}, "local": {} }, mlist = {};
var port = chrome.runtime.connect({ name: "save" });
port.onDisconnect.addListener(reconnect);
function reconnect() {
    port = chrome.runtime.connect({ name: "save" });
    port.onDisconnect.addListener(reconnect)
}

$(function () {
    const searchParams = new URLSearchParams(window.location.search)

    $('#ont').attr("href", "chrome-extension://" + chrome.runtime.id + "/popup.html?mode=tab")
    $('#onp').on('click', () => {
        var url = "chrome-extension://" + chrome.runtime.id + "/popup.html?mode=popup";
        chrome.windows.create({ url: url, type: "popup", focused: true, width: document.body.offsetWidth, height: document.body.offsetHeight });
        if (!searchParams.has("mode") || (searchParams.get("mode") != "tab" && searchParams.get("mode") != "popup")) {
            window.close();
        }
    });
    $('#clear').text(chrome.i18n.getMessage('clear'));
    $('#add').text(chrome.i18n.getMessage('add'));
    $('#delete').text(chrome.i18n.getMessage('delete'));
    $('#sync').text(chrome.i18n.getMessage('sync'));
    $('#local').text(chrome.i18n.getMessage('local'));
    $('title').text(chrome.i18n.getMessage('Name'));
    $("#memo").on('keydown', function (e) {
        if (e.keyCode === 9) {
            e.preventDefault();
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            elem.value = val.substr(0, pos) + '\t' + val.substr(pos, val.length);
            elem.setSelectionRange(pos + 1, pos + 1);
        }
    });
    $('#clear').on('click', clear_memo);
    $('#add').on('click', add_memo);
    $('#delete').on('click', delete_memo);
    (async () => {
        var items = await new Promise(resolve => { chrome.storage.sync.get({ "slist": [] }, resolve) });
        if (items.slist.length) { var sync = await new Promise(resolve => { chrome.storage.sync.get(items.slist, resolve) }) } else { var sync = {} };
        var local = await new Promise(resolve => { chrome.storage.local.get({ "memos": {}, "height": 5, "width": 64, "tab_size": 4, "selected": "" }, resolve) });
        if (searchParams.has("mode") && searchParams.get("mode") == "tab") {
            $('#memo').width("100%");
            $('#memo').height(window.innerHeight - $("#tooltips").outerHeight(true) - 25);
            $(window).resize(() => { $('#memo').height(window.innerHeight - $("#tooltips").outerHeight(true) - 25) })
        }
        else {
            $('#memo').attr('rows', local.height);
            $('#memo').attr('cols', local.width);
            if (searchParams.has("mode") && searchParams.get("mode") == "popup") {
                $('body').width("fit-content");
                window.resizeTo(document.body.offsetWidth + (window.outerWidth - window.innerWidth), document.body.offsetHeight + (window.outerHeight - window.innerHeight))
            }
        }
        $('#memo').css("tab-size", local.tab_size);
        memos["sync"] = sync;
        for (var name in sync) {
            mlist[name] = "sync";
        }
        for (var memo in local.memos) {
            if (!(memo in mlist)) {
                memos["local"][memo] = local.memos[memo];
                mlist[memo] = "local";
            }
        }
        var selected = local.selected;
        if (!Object.keys(memos["sync"]).length && !Object.keys(memos["local"]).length) {
            memos["local"] = { "Main": "" };
            mlist["Main"] = "local";
            selected = "Main";
        } else if (!selected || !Object.keys(mlist).includes(selected)) {
            selected = Object.keys(mlist)[0]
        }
        for (var stype of ["sync", "local"]) {
            for (var name in memos[stype]) {
                if (name == selected) {
                    $('#mlist_' + stype).append('<option value="' + name + '" selected>' + name + '</option>');
                }
                else {
                    $('#mlist_' + stype).append('<option value="' + name + '">' + name + '</option>');
                }
            }
        }
        $('#mlist').val(selected);
        $('#memo').val(memos[mlist[selected]][selected]);
        $('#slist').val(mlist[selected]);
        $('#mlist').change(change_memo());
        $('#slist').change(change_sync);
        $('#memo').on("input", send_content);
    })();
});


function try_save(tmemos, selected) {
    if ((new Blob([JSON.stringify(tmemos["sync"])])).size > chrome.storage.sync.QUOTA_BYTES - 2400) {
        alert(chrome.i18n.getMessage("size_over") + " ALL_STORAGE");
        return false
    }
    for (var memo in tmemos["sync"]) {
        if ((new Blob([JSON.stringify(tmemos["sync"][memo])])).size > chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 92) {
            alert(chrome.i18n.getMessage("size_over") + " PER_ITEM");
            return false
        }
    }
    port.postMessage([tmemos, selected]);
    return true;
}

function send_content() {
    var name = $("#mlist").val();
    const old = memos[mlist[name]][name];
    memos[mlist[name]][name] = $("#memo").val();
    var yn = try_save(memos, name);
    if (!yn) {
        $("#memo").val(old);
        memos[mlist[name]][name] = old;
    }
}

function change_memo() {
    var old = $('#mlist').val(), v = $('#mlist').val();
    return function () {
        v = $('#mlist').val();
        var tmemos = memos;
        tmemos[mlist[old]][old] = $('#memo').val();
        var result = try_save(tmemos, v);
        if (result) {
            $('#memo').val(tmemos[mlist[v]][v]);
            $("#slist").val(mlist[v]);
            memos = tmemos;
            old = v;
        } else {
            $('#mlist').val(old);
            v = old;
        }
    }
}

function clear_memo() {
    var name = $("#mlist").val();
    $("#memo").val("");
    memos[mlist[name]][name] = "";
    try_save(memos, name);
}

function add_memo() {
    var name = prompt(chrome.i18n.getMessage("confirm_add_memo"));
    if (name) {
        if (name in mlist) {
            alert(chrome.i18n.getMessage("same_memo_name"));
            return
        }
        else if (name in RESERVED) {
            alert(chrome.i18n.getMessage("reserved_word"));
            return
        }
        memos["local"][name] = "";
        mlist[name] = "local";
        $('#mlist_local').append('<option value="' + name + '">' + name + '</option>');
        $('#mlist').val(name);
        $('#mlist').trigger("change");
    }
}

function delete_memo() {
    var name = $('#mlist').val();
    var yn = confirm(chrome.i18n.getMessage("confirm_del_memo"));
    if (yn) {
        $('#mlist').val(Object.keys(mlist)[0]);
        $('#mlist').trigger("change");
        $('#mlist option[value="' + name + '"]').remove();
        delete memos[mlist[name]][name];
        delete mlist[name];
    }
}

function change_sync() {
    var name = $("#mlist").val();
    if (mlist[name] == "sync") {
        var src = "sync", dst = "local";
    } else {
        var src = "local", dst = "sync";
    }
    var tmemos = memos, tmlist = mlist;
    tmemos[dst][name] = tmemos[src][name];
    tmlist[name] = dst;
    delete tmemos[src][name];
    var result = try_save(tmemos, name);
    if (result) {
        $(".ui").prop("disabled", true);
        memos = tmemos;
        mlist = tmlist;
        setTimeout(() => location.reload(), 2000);
    }
    else {
        $("#slist").val(src);
    }
}
