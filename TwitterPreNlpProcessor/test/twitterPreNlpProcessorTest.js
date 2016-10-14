"use strict"

var assert = require('assert');
var sinon = require('sinon');  
var proxyquire = require('proxyquire').noCallThru(); 
var azure = require('azure-storage');  
var applicationinsights = require("applicationinsights");

describe('twitterPreNlpProcessor service', () => {
    let tweetQueueMessage ={
        "source": "twitter",
        "created_at": "2016-10-05T11:21:23.000Z",
        "message": {
            "created_at": "2016-10-05T11:21:23.000Z",
            "id": 783628146897748000,
            "geo": null,
            "lang": "ar",
            "source": "<a href=\"http://www.facebook.com/twitter\" rel=\"nofollow\">Facebook</a>",
            "text": "عبد الحسين شعبان: عن الديمقراطية والسوق https://t.co/Ji9295hnfS",
            "user_id": 108461154,
            "user_followers_count": 20153,
            "user_friends_count": 406,
            "user_name": "Libya Al-Mostakbal"
        }
    };

    var tableServiceStub = {  
        insertEntity: sinon.stub().callsArgWith(2, null, null)};

    var azureStub = {  
        createTableService: sinon.stub().returns(tableServiceStub) };

    var applicationinsightsStub = {  
        getClient: sinon.stub().returns({
            trackException:sinon.stub().returns("ok"),
            trackEvent:sinon.stub().returns("ok")
        }) 
    };

    var twitterPreNlpProcessor = proxyquire('../index.js', {  
        'azure-storage': azureStub,
        'applicationinsights':applicationinsightsStub
    }); 


    it('should push a message to NLP Input Azure Queue ', done => {
        let context = {
            log: msg => console.log,
            done: err => {
                if(err) {
                    console.log(err);
                }
                assert(!err);
                assert.equal(JSON.stringify(tweetQueueMessage), JSON.stringify(context.bindings.nlpInputQueueItem));
                done();
            },
            bindings:{}
        };

        twitterPreNlpProcessor(context, tweetQueueMessage);
    });

});