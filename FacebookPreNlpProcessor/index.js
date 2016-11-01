var azureStorage = require('azure-storage');
var appInsights = require("applicationinsights");
var appInsightsClient = appInsights.getClient();

module.exports = function (context, fbMsg) {
    context.log("hello YAY1222");
    appInsightsClient.trackEvent('FacebookPreNlpProcessor Azure Function has started');
    try{
        var guid = fbMsg.message.id;
            
        if(guid){
            var createdAt = new Date(fbMsg.created_at? fbMsg.created_at : Date.now());
            var pk = createdAt.getMonth()+1+''+ createdAt.getFullYear();
            if (pk.length == 5)
            {
                pk = "0" + pk;
            }
            var fbTableEntry = {
                    PartitionKey: pk,
                    RowKey: guid.toString(),
                    FBMessageMsg : JSON.stringify(fbMsg) ,
                    FBType : fbMsg.source};

            var fbTableName = process.env['FACEBOOK_TABLE_NAME'];
            var tableService = azureStorage.createTableService();

            tableService.insertEntity(fbTableName, fbTableEntry, function (error, result, response) {
                if(!error){
                    context.bindings.nlpInputQueueItem = fbMsg;
                    context.done();
                }
                else{
                    appInsightsClient.trackEvent('Entity with PartitionKey '+ pk+ ' and RowKey '+ guid.toString()+ ' already exists in table');
                    context.done('Entity with PartitionKey '+ pk+ ' and RowKey '+ guid.toString()+ ' already exists in table');
                }
            });
        }
        else{    
            context.done('Facebook message does not contain id: '+JSON.stringify(tweet));  
            appInsightsClient.trackException(new Error('fbMsg does not contain id: '+JSON.stringify(fbMsg)));
        } 
    }
     catch(error){
        context.log(error);
        appInsightsClient.trackException(error);
    }
}