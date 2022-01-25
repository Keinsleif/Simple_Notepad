chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.get("simple_memo",function(items){
        if (typeof items.simple_memo == "string"){
            chrome.storage.sync.set({"memos":{"Main":items.simple_memo}});
        }
        else if (items.simple_memo instanceof Object && !(items.simple_memo instanceof Array)){
            chrome.storage.sync.set({"memos":items.simple_memo});
            chrome.storage.sync.remove("simple_memo");
            chrome.storage.sync.get({height: 5, width: 60,tab_size: 4, selected: ""},function(items){
                chrome.storage.local.set(items);
                chrome.storage.sync.remove(Object.keys(items));
            });
        }
    });
});

var port;
chrome.runtime.onConnect.addListener(function(p) {
    port=p;
    port.onMessage.addListener(listen_mes());
});
function listen_mes(){
    var timer;
    return function(items){
        clearTimeout(timer);
        timer=setTimeout(function(){
            chrome.storage.local.set({"memos":items[0]["local"],"selected":items[1]});
            chrome.storage.sync.set({"memos":items[0]["sync"]});
        },2000)
    }
}