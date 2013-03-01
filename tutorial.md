Tutorial
========

In this tutorial we will use Meteor to create an application. Having worked my way through a few Meteor tutorials I am 
intentionally exploring ways to structure a Meteor application little bit more realistically. 

The application we are building is called notes. Notes is a 'sticky note' application that allows the user to arrange 
sticky notes on a web page. 

Starting Out
------------

To follow along, you need to have Meteor installed. Follow the instructions at http://docs.meteor.com to get it. 

    curl https://install.meteor.com | /bin/sh 

Create your project using the normal method. Open a terminal, navigate the folder you wish to *contain* the application 
folder and execute the `meteor create` command:

    cd ~/meteor-apps
    meteor create notes

This command creates the application folder and initial meteor. You can immediately run the application as it says:
    
    cd notes
    meteor

Go ahead and open the application in one or more browsers (by default, this will be at http://localhost:3000) The 
application as it gets created doesn't do much. You will want to leave meteor running and enter further meteor commands
in another terminal window. This will mean that all HTML, JavaScript, CSS and data changes will be pushed to your own 
browser session(s). 

If you have the initial application running we can move on. 

Gawk at Automatically Refreshing Browser Sessions
-------------------------------------------------------

One the coolest features of Meteor is the automatic refreshing of browser windows in response to changes initiated on 
the server (or any other client for that matter). To demonstrate this, lets remove some of the page markup and sample 
data handling created with the application. As we save our files, our Browser updates automatically. Perform the 
following changes, saving periodically and observing the result:

In `notes.html`:

* Change the title tag texts from 'notes' to 'Notes'
* Change the H1 tag from 'Hello World' to 'Notes!'
* Remove the '{{ Greeting }}' variable output and the input tag

In `notes.js`:

* Comment out the two template function assignments. You could delete them but until you have other examples of template
  helpers and event assignments the examples might be useful

About our Application
---------------------

My ambition in creating a Sticky Note application is to all one user or a group of users (ie a team) write and arrange 
notes on a board, like you would when collecting ideas or +1s from a meeting (my background is Agile Software 
Development, so I immediately think of Retrospectives).

So our application needs to have a concept of boards as groups or containers of individual notes.

Someday our application might allow users to place their notes wherever they like on the board, using whatever colour 
paper, tag and display their notes in a multitude of ways. But we will start much simpler and see how far we go

Taking Notes
------------

Our first goal is simply to give the user (any user) to ability to create, update or delete notes on a board. To start 
with, our 'board' is really just a list and our 'note' is a single String of text. 

Our first step is to expose a MongoDb document Collection (Mongo support comes out of the box with Meteor, see xxx for 
details). Our model will consist of a collection of boards, each of which will have a list of notes. 

All application logic, client and server, is written in JavaScript. Open the notes.js file that was created for you and
add the following to the top (outside the Meteor.isClient() conditional - we want this to run on both client and server).

    var boardCollection = new Meteor.Collection("Boards");

Save the file and your browser session(s) will refresh without any visible change. A lot has happened, however. By 
default Meteor applications comes with two packages enabled: AutoPublish and Insecure, that make exposing data for 
viewing and updating as easy as the above declaration. To test this out, open your Browser's console and run some 
commands against the client's Mongo interface:

    > boardCollection
      Meteor.Collection {...}
    > boardCollection.insert({name:"default", notes:[{text:"a note"},{text:"another note"}]});
      "HrQkGmyCZBwNEnFYc"
    > boardCollection.findOne({_id:"HrQkGmyCZBwNEnFYc"});
      Object {_id: "HrQkGmyCZBwNEnFYc", name: "default", notes: Array[2]}

Meteor uses MiniMongo on the client side to provide a Mongo API into collections like boards. Using commands like the 
above you can insert, update and delete data straight from the console. This data is immediately synchronised across 
across the server and using our current configuration, all clients as well. Try opening another browser window 
navigating to the same page (http://localhost:3000) and running this on the console:

    > boardCollection.findOne({name:"default"});
      Object {_id: "HrQkGmyCZBwNEnFYc", name: "default", notes: Array[2]}

Displaying Notes
----------------

We are going to use the board 'default' we created above and use it by, well, default for the next while. We will only 
worry about a single board with one set of notes on it. Now we will display the 2 notes we created above. 

Lets clean up our notes.html to provide a more structured use of templates. Meteor comes with HandleBars templates (at 
XXX) out of the box and that is what we will continue to use here.

We will rename the 'hello' template to 'body' and move the H1 header tag outside. Inside of our new body template we 
will invoke a 'notes' template:

    <head>
      <title>Notes</title>
    </head>

    <body>
      <h1>Notes!</h1> 
      {{> body}}
    </body>

    <template name="body">
      {{> noteslist }}
    </template>

    <template name="noteslist">
      <h2>Notes List</h2>
      <ul>
        <li>Note 1</li>
        <li>Note 2</li>
      </ul>
    </template>

Within the 'notes' template I have an unordered list and have 2 sample note items. Save the file, observe the changes. 
To make the note list itself dynamic, we will need to rewrite the 'notes' template:

    <template name="notes">
      <h2>Notes List</h2>
      <ul>
        {{#each notes }}
          <li>{{ text }}</li>
        {{/each}}
      </ul>
    </template>

We also need to supply the data to the template by means of a template helper in notes.js. Add the following function 
assignment in the Meteor.isClient() conditional next to the commented out JavaScript from before:

    Template.noteslist.notes = function() {
      var defaultBoard = boards.findOne({name:"default"});
      if(defaultBoard && defaultBoard.notes) {
        return defaultBoard.notes;
      }
    }

Since we are assuming the board "default" will always exist, we can add a subroutine to the server to make sure this is 
the case when it starts. We will also log when the server starts and the results of our check to the server console (in 
our case, the terminal window running Meteor).

Again in notes.js, add the following within the *server* conditional (Meteor.isServer()):

    Meteor.startup(function () {

      // code to run on server at startup
      console.log("Notes Application Starting...")
      
      // make sure default board exists with sample data
      var defaultBoard = boardCollection.findOne({name:"default"});
      if(!defaultBoard || defaultBoard == null) {
        console.log("Creating new default board...");
        boardCollection.insert({name:"default", notes:[{text:"a note"},{text:"another note"}]});
      } else {
        console.log("Default board found.");      
      }              
    });

Now if you remove the default or all the boards in the datastore (`boards.remove({})` in the browser console works well 
for this) and restart the server you will see our sample data is returned. 

Creating Notes
--------------

To give us the facility to create new notes we need to:

1. Provide an interface for the user to create the new space
2. Respond to this request by creating the new notes
3. Update the notes list to show the new note.

Thankfully Meteor will handle the last task. To create the interface, open notes.html. Lets create a new template for 
our new note interface. 

Add the following template to the file:

    <template name="newnote">
      <p>
        <input type="text" id="new-note-input" placeholder="Enter your new note here">
        <button name="new-note-save-button">Create</button>      
      </p>    
    </template>

**Note:** When naming templates, bear in mind our automatically paired JavaScript helpers will use the same naming. For 
this reason you should use names that are valid in a JavaScript context.

And update our body template to include it:
    
    <template name="body">
      {{> noteslist }}
      {{> newnote }}
    </template>

We now have an interface to create a new note. It doesn't do anything though, so lets fix that up. Add the following 
to your notes.js file, within the Meteor.isClient() conditional:

    Template.newnote.events({
      'click #new-note-button'   :   Template.newnote.addNewNoteFromButton,
      'keypress #new-note-input' :   Template.newnote.addNewNoteIfEnterPressed 
    });

This is an event map, and it maps DOM Element events to handlers. Most Tutorials seem to define handlers inline; About 
we are separating out the function code to keep our event map highly readable. We therefore need to define these 
handlers. In the first case, we want to create a new note when someone clicks the Create button. In the other we want to
create a new note if someone simply hits return after puting something in the field.

Create these handlers above this event map:

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
    
In this code we are calling yet another undefined function - Boards.addNewNote(). We could have defined this inline, but
old habits prevent me from this minor duplication. Instead, lets create a domain object to centralise our model 
code. Add this function outside of both client- and server- conditionals in notes.js:

var Boards = function() {

  var addNewNote = function(noteText) {
      boardCollection.update({name:"default"}, {$addToSet:{notes:{text:noteText}}});
  };  

  return {
    addNewNote: addNewNote
  };  
}();

There you go. Wait for the web page to refresh and add some notes using the interface. 

Deleting Notes
--------------
The next thing to do is to allow users to delete notes. To do this we will add a delete link (in the form of a text 
'[x]').  


