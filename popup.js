'use strict';
var timer, wait_time, memos;
var background = chrome.extension.getBackgroundPage();
$(function(){
    $('#clear').text(chrome.i18n.getMessage('clear'));
    $('#add').text(chrome.i18n.getMessage('add'));
    $('#delete').text(chrome.i18n.getMessage('delete'));
    $('title').text(chrome.i18n.getMessage('Name'));
    $('#clear').on('click',clear_memo);
    $('#add').on('click',add_memo);
    $('#delete').on('click',delete_memo);
    chrome.storage.sync.get({"simple_memo": {},height: 5,width: 60,time: 3000},function(items) {
        $('#memo').attr('rows',items.height);
        $('#memo').attr('cols',items.width);
        wait_time=items.time;
        memos=items.simple_memo;
        if (Object.keys(memos).length==0){
            memos={"Main": ""};
        }
        for (var name in memos){
            $('#mlist').append('<option value="'+name+'">'+name+'</option>');
        }
        $('#mlist').val(Object.keys(memos)[0]);
        $('#memo').val(memos[Object.keys(memos)[0]]);
        $('#mlist').change(change_memo());
    });
    $(window).on("unload",save_unload);
});

function save_unload(){
    memos[$('#mlist').val()]=$('#memo').val();
    background.chrome.storage.sync.set({"simple_memo":memos});
}

function change_memo(){
    var old=$('#mlist').val(),v=$('#mlist').val();
    return function(){
        v=$('#mlist').val();
        memos[old]=$('#memo').val();
        $('#memo').val(memos[v]);
        chrome.storage.sync.set({"simple_memo": memos});
        old = v;
    }
}

function add_memo() {
    var name = prompt(chrome.i18n.getMessage("confirm_add_memo"));
    $('#mlist').append('<option value="'+name+'">'+name+'</option>');
    $('#mlist').val(name);
    $('#mlist').trigger("change");
}

function delete_memo(){
    var name = $('#mlist').val();
    var yn = confirm(chrome.i18n.getMessage("confirm_del_memo"));
    if (yn){
//        chrome.storage.local.get({"backup":[]},function(items){
//            if ($("#memo").val()){
//                var backup=items.backup;
//                backup.append($("#memo").val());
//                chrome.storage.local.set({"backup":backup});
//            }
            $('#mlist').val(Object.keys(memos)[0]);
            $('#mlist').trigger("change");
            $('#mlist > option[value='+name+']').remove();
            delete memos[name];
//        });
    }
}

function clear_memo() {
    $("#memo").val("");
    memos[$('#mlist').val()]="";
    chrome.storage.sync.set({"simple_memo":memos});
}