import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tickets } from '../api/tickets.js';

import './admin.html';
import './home.html';
import './singleticket.html';
import './submit.html';
import './ticket.html';
import './ticketview.html';
import './login.html';

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

Router.route('/', function () {
  this.render('homepage');
});

Router.route('/view', function () {
  if (Meteor.userId()) {
    this.render('ticketview');
  } else this.render('login');
});

Router.route('/add', function () {
  if (Meteor.userId()) {
    this.render('submit');
  } else this.render('login');
});

Router.route('/admin', function () {
  if (Meteor.userId()) {
    this.render('admin');
  } else this.render('login');
});

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

Template.homepage.events({
		'click #submitbutton': function (event) {
				event.preventDefault();
				const target = event.target.parentElement.parentElement;
				const ticketnum = target.yourticketinput.value;
				Router.go('/view/' + ticketnum);
		},
		'click #btn-login': function (event) {
				event.preventDefault();
				Router.go('/view');
		}
});

Template.singleticket.rendered = function () {
  $(document).ready(function () {
    setTimeout(function () {
      if ($('body').find('#ticketnum').text() === '') {
        Router.go('/');
      }
    }, 500);
  });
};

Template.ticketview.helpers({
  tickets() {
    return Tickets.find({}, { sort: { createdAt: -1 } });
  },
});

Template.ticketview.events({
  'click .ticket-list .tbtn': function (event) {
    const target = event.target;
    $(target).parent().parent().parent()
    .find('ul')
    .toggle();
  },
  'click .btn-resolve': function (event) {
    const target = event.target;
		$(target).toggle();
    const numtofind = parseInt($(target).parent().parent().parent()
      .parent()
      .find('.ticketnum')
      .text(), 10);
    const ticket = Tickets.findOne({ number: numtofind });
    Tickets.update({ _id: ticket._id }, { $set: { status: 'resolved' } });
  },
});

Template.singleticket.events({
		'click .btn-resolve': function (event) {
				event.preventDefault();
				console.log("Got event!");
				const target = event.target;
				$(target).toggle();
				const numtofind = parseInt( $('#ticketnum').text(), 10 );
				const ticket = Tickets.findOne({ number: numtofind });
				Tickets.update({ _id: ticket._id }, { $set: { status: 'resolved' } });
		},
		'submit form': function (event) {
				event.preventDefault();
				const target = event.target;
				const numtofind = parseInt( $('#ticketnum').text(), 10 );
				const author = Meteor.user().emails[0].address;
				const body   = target.commentbody.value;
				console.log(numtofind + "|" + author + "|" + body);
				const ticket = Tickets.findOne({ number: numtofind }); //get the actual ticket
				console.log(ticket);
				const arro   = ticket.comments;
				let   arrnew = [{}];
				if (typeof(arro) === "undefined"){
						console.log(arro);
						arrnew = [{author, body}];
				}
				else{
						arrnew = arro;
						arrnew.push({author, body});
				}
				Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } });
				target.commentbody.value = "";
		},
});

Template.submit.onCreated(function submitOnCreated() {
  // variable to keep track of final priority value
  this.prioritysel = new ReactiveVar('D');
  this.priorityclass = new ReactiveVar('btn-info');
});

Template.submit.helpers({
  prioritysel() {
    return Template.instance().prioritysel.get();
  },
  priorityclass() {
    return Template.instance().priorityclass.get();
  },
});

Template.submit.events({
  'click .pri-btn': function (event) {
    event.preventDefault();
    const target = event.target;
    const val = target.innerHTML;
    if (val === 'Priority A') {
      Template.instance().prioritysel.set('A');
      Template.instance().priorityclass.set('btn-danger');
    } else if (val === 'Priority B') {
      Template.instance().prioritysel.set('B');
      Template.instance().priorityclass.set('btn-warning');
    } else if (val === 'Priority C') {
      Template.instance().prioritysel.set('C');
      Template.instance().priorityclass.set('btn-primary');
    } else if (val === 'Priority D') {
      Template.instance().prioritysel.set('D');
      Template.instance().priorityclass.set('btn-info');
    }
  },
  'click #finalpriority': function (event) {
    event.preventDefault();
  },
  'click #submit-btn'(event) {
    event.preventDefault();
    const target = event.target.parentElement;
    const description = target.description.value;
    const priority = target.finalpriority.innerHTML;
    const youremail = Meteor.user().emails[0].address;
    const rpiemail = target.rpiemailin.value;
    const issuetype = target.issuetype.value;
    const status = 'new-ticket';
		const comments = [];
    let number = Tickets.findOne({}, { sort: { createdAt: -1 } });
    if (typeof (number) === 'undefined') {
      number = 2760001;
    } else number = number.number + 1;
    if (description === '' || priority === '' || youremail === '' || rpiemail === '' || issuetype === '') {
      badform("Something wasn't set, try again!");
      return false;
    }
    Tickets.insert({
      description,
      youremail,
      rpiemail,
      issuetype,
      priority,
      number,
      status,
			comments,
      createdAt: new Date(),
    });

    Router.go('/view');
  },
});
