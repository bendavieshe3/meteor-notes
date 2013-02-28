var boards = new Meteor.Collection("Boards");

if (Meteor.isClient) {

  /*
  Template.hello.greeting = function () {
    return "Welcome to notes.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });*/

  Template.noteslist.notes = function() {
    var defaultBoard = boards.findOne({name:"default"});
    if(defaultBoard && defaultBoard.notes) {
      return defaultBoard.notes;
    }
  }

}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code to run on server at startup
    console.log("Notes Application Starting...")
    
    // make sure default board exists with sample data
    var defaultBoard = boards.findOne({name:"default"});
    if(!defaultBoard || defaultBoard == null) {
      console.log("Creating new default board...");
      boards.insert({name:"default", notes:[{text:"a note"},{text:"another note"}]});
    } else {
      console.log("Default board found.");      
    }        

    
  });
}
