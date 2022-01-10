chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.get("simple_memo",function(items){
        if (typeof items.simple_memo == "string"){
            chrome.storage.sync.set({"memos":{"Main":items.simple_memo}});
        }
        else if (items.simple_memo instanceof Object && !(items.simple_memo instanceof Array)){
            memos={"sync":items.simple_memo,"local":{}};
            chrome.storage.sync.set({"memos":memos})
        }
    });
});


chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(listen_mes());
});
function listen_mes(){
    var timer;
    return function(items){
        console.log(items);
        clearTimeout(timer);
        timer=setTimeout(function(){
            chrome.storage.local.set({"memos":items[0]["local"],"selected":items[1]});
            chrome.storage.sync.set({"memos":items[0]["sync"]});
        },2000)
    }
}