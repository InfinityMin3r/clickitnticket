// Import external meteor packages
import { Template } from 'meteor/templating';
import { Tickets } from '../api/tickets.js';

// Import HTML pages
import './admin.html';
import './home.html';
import './singleticket.html';
import './submit.html';
import './ticket.html';
import './ticketview.html';
import './login.html';
import './404.html';
import './users.html';


// Non-blocking alert for bad user-input
function badform() {
  $(document).ready(function () {
    toastr;
    toastr.options = {
      closeButton: false,
      debug: false,
      newestOnTop: true,
      progressBar: true,
      positionClass: 'toast-top-full-width',
      preventDuplicates: true,
      showDuration: '3000',
      hideDuration: '3000',
      timeOut: '3000',
      extendedTimeOut: '3000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
    };
    toastr.warning('Please fill out all fields!', 'Empty Fields!');
  });
}

// Non-blocking alert for invalid ticket number
function invalidTicketNumber() {
  $(document).ready(function () {
    toastr;
    toastr.options = {
      closeButton: false,
      debug: false,
      newestOnTop: true,
      progressBar: true,
      positionClass: 'toast-top-full-width',
      preventDuplicates: true,
      showDuration: '3000',
      hideDuration: '3000',
      timeOut: '3000',
      extendedTimeOut: '3000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
    };
    toastr.warning('Please double check your input and try again.', 'Invalid Ticket Number!');
  });
}

/*
Routing functions.  Controls how users move throughout the site.
Most routes include checks for user authentication to protect information
*/

Router.configure({
  notFoundTemplate: '404',
});

// Primary route, runs the homepage template when a user browses to the root of the site.
Router.route('/', function () {
  this.render('homepage');
});

// Route for viewing all tickets. Checks if user is authenticated, if not, redirect to login page.
Router.route('/view', function () {
  if (Meteor.userId()) {
    this.render('ticketview');
  } else this.render('login');
});

// Route for creating a ticket. Checks if user is authenticated, if not, redirect to login page.
Router.route('/add', function () {
  if (Meteor.userId()) {
    this.render('submit');
  } else this.render('login');
});

// Route for admin page.  Not currently used, template for future expanion.
Router.route('/admin', function () {
  if (Meteor.userId()) {
    this.render('admin');
  } else this.render('login');
});

// Route for loading specific ticket.  Used for unauthenticated viewing.
Router.route('/view/:ticket', {
  name: 'singleticket',
  template: 'singleticket',
  data: function () {
    const numtofind = parseInt(this.params.ticket, 10);
    const result = Tickets.findOne({ number: numtofind });
    if (result) return result;
  },
  action: function () {
    this.render();
  },
});



Router.route('/admin/users', function () {
  if (Meteor.userId()) {
    this.render('users');
  } else this.render('ticketview');
});

// Functions for logout.

// Redirects user to homepage after logout.
const myPostLogout = function () {
  Router.go('/');
};

// Defines logout hook, enabling above function.
AccountsTemplates.configure({
  onLogoutHook: myPostLogout,
});

// Event for logout button on single ticket page.
Template.singleticket.events({
  'click #logout': function () {
    AccountsTemplates.logout();
  },
});

// Event for logout button on create ticket page.
Template.submit.events({
  'click #logout': function () {
    AccountsTemplates.logout();
  },
});

// Event for logout button on ticket list page.
Template.ticketview.events({
  'click #logout': function () {
    AccountsTemplates.logout();
  },
});

// Events for homoepage.
Template.homepage.events({
  'click #submitbutton': function (event) { // Event for submit button.  Checks of number is valid, then loads single ticket view
    event.preventDefault();
    const target = event.target.parentElement.parentElement;
    const ticketnum = target.yourticketinput.value;
    const ticketint = parseInt(ticketnum, 10);
    const result = Tickets.findOne({ number: ticketint });
    if (typeof (result) === 'undefined') {
      target.yourticketinput.value = '';
      invalidTicketNumber();
      return;
    }
    Router.go('/view/' + ticketnum);
  },
  'click #btn-login': function (event) { // Event for login button.  Call ticket list route
    event.preventDefault();
    Router.go('/view');
  },
});

// Check if user directly inputs ticket number into URL, return to homepage if invalid number
Template.singleticket.rendered = function () {
  $(document).ready(function () {
    setTimeout(function () {
      if ($('body').find('#ticketnum').text() === '') {
        Router.go('/');
      }
    }, 500);
  });
};

// Sorts tickets but order of creation for ticket list
Template.ticketview.helpers({
  tickets() {
    return Tickets.find({}, { sort: { createdAt: -1 } });
  },
});

// Events for ticket list
Template.ticketview.events({
  'click #adminbutton': function (event) { // Event for login button.  Call ticket list route
    event.preventDefault();
    Router.go('/admin');
  },
  'click .ticket-list .tbtn': function (event) { // Event for ticket toggle button, expands current ticket.
    const target = event.target;
    $(target).parent().parent().parent()
    .find('ul')
    .toggle();
  },
  'click .btn-open': function (event) { // Event for open ticket button.  Loads current ticket on single page.
    const target = event.target;
    const numtofind = $(target).parent().parent()
    .parent()
    .find('.ticketnum')
    .text();
    Router.go('/view/' + numtofind);
  },
  'click .btn-resolve': function (event) { // Event for resolve ticket button.  Changes ticket status to resolve.
    const target = event.target;
    $(target).toggle();
    const numtofind = parseInt($(target).parent().parent()
      .parent()
      .find('.ticketnum')
      .text(), 10);
    const body = 'Ticket resolved by ' + Meteor.user().emails[0].address;
    Meteor.call('tickets.resolve', numtofind, body, false);
  },
  'click .btn-reopen': function (event) { // Event for resolve ticket button.  Changes ticket status to resolve.
    const target = event.target;
    $(target).toggle();
    const numtofind = parseInt($(target).parent().parent()
      .parent()
      .find('.ticketnum')
      .text(), 10);
    const body = 'Ticket reopened by ' + Meteor.user().emails[0].address;
    Meteor.call('tickets.resolve', numtofind, body, true);
  },
});

// Events for single ticket
Template.singleticket.events({
  'click .btn-resolve': function (event) { // Event for resolve ticket button.  Changes ticket status to resolve.
    event.preventDefault();
    const target = event.target;
    $(target).toggle();
    const numtofind = parseInt($('#ticketnum').text(), 10);
    const body = 'Ticket resolved by ' + Meteor.user().emails[0].address;
    Meteor.call('tickets.resolve', numtofind, body, false);
  },
  'click .btn-reopen': function (event) { // Event for resolve ticket button.  Changes ticket status to resolve.
    event.preventDefault();
    const target = event.target;
    $(target).toggle();
    const numtofind = parseInt($('#ticketnum').text(), 10);
    const body = 'Ticket reopened by ' + Meteor.user().emails[0].address;
    Meteor.call('tickets.resolve', numtofind, body, true);
  },
  'submit form': function (event) { // Event for ticket commenting.  Logs current username and adds new comment.
    event.preventDefault();
    const target = event.target;
    const numtofind = parseInt($('#ticketnum').text(), 10);
    const body = target.commentbody.value;
    const author = Meteor.user().emails[0].address;
    Meteor.call('tickets.comment', numtofind, body, author);
    target.commentbody.value = '';
  },
});

// Event for new ticket submission.
Template.submit.events({
  'click #submit-btn'(event) { // Store all fields and log current user information
    event.preventDefault();
    const target = event.target.parentElement;
    const namein = target.namein.value;
    const rpiemail = target.rpiemailin.value;
    const altemail = target.altemailin.value;
    const phonein = target.phonein.value;
    const issuetype = target.issuetype.value;
    const priority = target.priority.value;
    const summary = target.summary.value;
    const description = target.description.value;
    const youremail = Meteor.user().emails[0].address;
    const status = true;
    const comments = [];
    let number = Tickets.findOne({}, { sort: { createdAt: -1 } });
    if (typeof (number) === 'undefined') { // Set ticketnumber
      number = 2760001;
    } else number = number.number + 1;
    // Check if all fields complete, do not submit if missing information
    if (namein === '' || rpiemail === '' || phonein === '' || description === '' || priority === '' || youremail === '' || rpiemail === '' || issuetype === '' || summary === '') {
      badform();
      return false;
    }
    // Store ticket information in database
    Meteor.call('tickets.insert',
      namein,
      rpiemail,
      altemail,
      phonein,
      issuetype,
      priority,
      summary,
      description,
      youremail,
      number,
      status,
      comments);
    // Route user to ticket list
    Router.go('/view');
  },
});

Template.users.events({
  'click .userId': function () {
      Session.set('allusers',this);
  },
  'click .setAdmin':function() {
    Meteor.call('edit',this._id,'Admin');
  },
  'click .setTech':function() {
    Meteor.call('edit',this._id,'Technician');
  },
  'click .setDesk':function() {
    Meteor.call('edit',this._id,'Help Desk');
  },
  'click .setNormal':function() {
    Meteor.call('edit',this._id,'Normal User');
  },

});


Meteor.subscribe("directory");

Template.users.helpers({
  email: function(){
  return this.emails[0].address; 
 },
 allusers:function(){
  return Meteor.users.find({});
 },
 role: function(){
  if (Roles.userIsInRole(this, ['Admin']))
    return "Administrator";
  else if (Roles.userIsInRole(this, ['Technician']))
    return "Technician";
  else if (Roles.userIsInRole(this,['Help Desk']))
    return "Consultant";
  else 
    return "Normal User";
  },
});



