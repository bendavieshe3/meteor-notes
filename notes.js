var boardCollection = new Meteor.Collection("Boards");

var Boards = function() {

  var addNewNote = function(noteText) {
    boardCollection.update({name:"default"}, {$addToSet:{notes:{text:noteText}}});
  };

  var deleteNote = function(noteText) {
    if(!noteText) return;
    boardCollection.update({name:"default"}, {$pull:{notes:{text:noteText}}});
  }

  return {
    addNewNote: addNewNote,
    deleteNote: deleteNote
  };  
}();


if (Meteor.isClient) {

  Template.noteslist.notes = function() {
    var defaultBoard = boardCollection.findOne({name:"default"});
    if(defaultBoard && defaultBoard.notes) {
      return defaultBoard.notes;
    }
  };

  Template.noteslist.deleteNoteFromLink = function(event, template) {
    Boards.deleteNote(event.target.id);
  };

  Template.noteslist.events({
    'click a.delete-link' :   Template.noteslist.deleteNoteFromLink
  });

  
  Template.newnote.addNewNoteFromButton = function(event, template) {
    var input =  template.find('#new-note-input');
    if(input.value.trim()) { Boards.addNewNote(input.value); }
    input.value = '';    
  };

  Template.newnote.addNewNoteIfEnterPressed = function(event, template) {
    var input =  template.find('#new-note-input');
    if(event.which == 13) {
      if(input.value.trim()) { Boards.addNewNote(input.value); }
      input.value = '';
    }
  };

  Template.newnote.events({
    'click #new-note-button'   :  Template.newnote.addNewNoteFromButton,
    'keypress #new-note-input' :  Template.newnote.addNewNoteIfEnterPressed,
    'click .delete-link' :  function(e,t){ alert('here');}
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code to run on server at startup
    console.log("Notes Application Starting...");
    
    // make sure default board exists with sample data
    var defaultBoard = boardCollection.findOne({name:"default"});
    if(!defaultBoard || defaultBoard == null) {
      console.log("Creating new default board...");
      boardCollection.insert({name:"default", notes:[{text:"a note"},{text:"another note"}]});
    } else {
      console.log("Default board found.");      
    }        

    
  });
}
