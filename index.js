var casper = require('casper').create(/* { verbose: true, logLevel: "debug" } */),
        fs = require('fs');

var APEX_URL = 'http://apexsiam-square.com';

/**
 * Show logs from client script environment
 */
casper.on('remote.message', function(msg) {
  this.echo('[REMOTE MESSAGE]: ' + msg);
});

casper.start(APEX_URL + '/home.asp');

var movies = {};

casper.then(function(response) {
  this.echo('Apex Home: ' + this.getTitle());
  
  movies = this.evaluate(function(){
    var items = document.querySelectorAll('a > img');
    var data = {};
    for(var i=0; i < items.length; i++){
      //console.log(items[i]);
      
      var link = items[i].parentNode.getAttribute('href')
      //console.log(link);
      if(link.indexOf('popup.asp?id=') === 0){
        var id = link.substring(('popup.asp?id=').length);
        data[id] = { 
          id: id
        };
        // data.push({
        //   'link': link
        // });
      }
    }

    return data;
  });
  
  casper.eachThen(Object.keys(movies), function(response) {

    var movieId = response.data;
    casper.wait(10000, function() {
      this.echo('crawling page ' + movieId);
      this.thenOpen(APEX_URL + '/popup.asp?id=' + movieId, function() {
        
        this.echo('got response for' + movieId);
        var item = this.evaluate(function() {
          var item = document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > span');
          return {
            'name': item.innerText
          };
        });

        if(movies[movieId]){
          movies[movieId].name = item.name;
        }
      });

    });    

  });

});

casper.then(function(){
  console.log('== Hello ==');
  this.echo(JSON.stringify(movies, null, 2));
});

casper.run();
