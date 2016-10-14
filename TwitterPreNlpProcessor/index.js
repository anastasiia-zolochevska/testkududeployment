var azureStorage = require('azure-storage');
var appInsights = require("applicationinsights");
var appInsightsClient = appInsights.getClient();

module.exports = function (context, tweet) {
    appInsightsClient.trackEvent('TwitterPreNlpProcessor Azure Function has started');
    try{
        var message = tweet.message;
        var guid = message.id;
            
        if(guid){
            var createdAt = new Date(tweet.created_at? tweet.created_at : Date.now());
            var pk = createdAt.getMonth()+1+''+ createdAt.getFullYear();
            if (pk.length == 5)
            {
                pk = "0" + pk;
            }
            var tweetTableEntry = {
                    PartitionKey: pk,
                    RowKey: guid.toString(),
                    TweetMsg : JSON.stringify(tweet), 
                    Geo : message.geo, 
                    Lang : message.lang};

            var tweetTableName = process.env['TWEET_TABLE_NAME'];
            var tableService = azureStorage.createTableService();

            tableService.insertEntity(tweetTableName, tweetTableEntry, function (error, result, response) {
                if(!error){
                    context.bindings.nlpInputQueueItem = tweet;
                    context.done();
                }
                else{
                    appInsightsClient.trackEvent('Entity with PartitionKey '+ pk+ ' and RowKey '+ guid.toString()+ ' already exists in table');
                    context.done('Entity with PartitionKey '+ pk+ ' and RowKey '+ guid.toString()+ ' already exists in table');
                }
            });
        }
        else{  
            context.done('Tweet message does not contain id: '+JSON.stringify(tweet));    
            appInsightsClient.trackException(new Error('Tweet message does not contain id: '+JSON.stringify(tweet)));
        } 
    }
     catch(error){
        context.log(error);
        appInsightsClient.trackException(error);
    }
}