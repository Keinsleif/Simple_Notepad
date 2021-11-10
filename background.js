chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.get("simple_memo",function(items){
        if (typeof items.simple_memo == "string"){
            chrome.storage.sync.set({"simple_memo":{"Main":items.simple_memo}});
        }
    });
});