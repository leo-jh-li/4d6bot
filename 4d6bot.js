var Twit = require('twit');
var T = new Twit(require('./config.js'));

var content = require('./content.js');

var handle = '@4d6bot';

var stream = T.stream('statuses/filter', { track: [handle] });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet) {
  if(validateCommand(tweet)) {
    var tweetId = tweet.id_str;
    var username = tweet.user.screen_name;
    var message = "@" + username + "\n" + craftText();
    var tweetParams = { status: message, in_reply_to_status_id: tweetId};
    T.post('statuses/update', tweetParams, function(err, data, response) {
      if(err) {
        console.log("Failed to tweet.", err);
      } else {
        console.log("Tweet success: \n" + tweetParams.status);
      }
    });
  }
}

var validCommand = /roll me|rollme/i;
var validateCommand = function (tweet){
  return validCommand.test(tweet.text);
};

/*
Final tweet will look something like:
Class: Barbarian
Alignment: Lawful Neutral
Trait: [trait]
STR: 11
DEX: 13
CON: 4
INT: 14
WIS: 13
CHA: 14
*/
var craftText = function(){
  var text = "";
  text += "Class: " + content.classes[Math.floor(Math.random() * content.classes.length)] + "\n";
  text += "Alignment: " + content.alignments[Math.floor(Math.random() * content.alignments.length)] + "\n";
  text += "Trait: " + content.traits[Math.floor(Math.random() * content.traits.length)] + "\n";
  text += generateStats();
  return text;
};

var generateStats = function(){
  var stats = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  // determine IVs
  var highStat = Math.floor((Math.random() * 6) + 1);
  var lowStat = Math.floor((Math.random() * 6) + 1);
  while (lowStat == highStat) {
    lowStat = Math.floor((Math.random() * 6) + 1);
  }

  var text = "";
  for (var i = 0; i < stats.length; i++) {
    if (i == highStat) {
      text += stats[i] + ": " + roll(6, 6, "L", 3) + "\n";
    } else if (i == lowStat) {
      text += stats[i] + ": " + roll(4, 6, "H", 1) + "\n";
    } else {
      text += stats[i] + ": " + roll(4, 6, "L", 1) + "\n";
    }
  }
  return text;
};

/**
 * Roll @type dice @quantity times.
 * If @dropType is "L", drop @dropQuantity lowest rolls.
 * If @dropType is "H", drop @dropQuantity highest rolls.
 */
var roll = function(quantity, type, dropType, dropQuantity){
  var rolls = [];
  for (var i = quantity; i > 0; i--){
    rolls.push(Math.floor((Math.random() * type) + 1));
  }
  if (dropType) {
    rolls.sort();
    switch (dropType) {
      case "L":
        rolls = rolls.slice(dropQuantity);
        break;
      case "H":
        rolls = rolls.slice(0, rolls.length-dropQuantity);
        break;
    }
  }
  var total = 0;
  rolls.forEach(function(val){
    total += val;
  });
  return total;
};
