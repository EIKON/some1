// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Meteor.startup(function() {
    Session.set("sort_order", {score: -1, name: 1});
  });

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get("sort_order")});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },

   'click input.sort': function() {
      var sortOrder = Session.get("sort_order");
   
      if (Object.keys(sortOrder)[0] == "score") { // sort by score desc
        Session.set("sort_order", { name: 1, score: -1 }); // sort by name
      }
      else {
        Session.set("sort_order", { score: -1, name: 1 }); // sort by score desc
      }
    },

  'click input.randomise': function() {
    Players.find({}).forEach(function(player) {
      Players.update(player, {$set: {score: randomScore()}});
    });
  }


  });
  
  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

var randomScore = function() {
  return Math.floor(Math.random()*10)*5;
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: randomScore()});
    }
  });
}
