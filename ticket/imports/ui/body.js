import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tickets } from '../api/tickets.js';

import './admin.html';
import './home.html';
import './singleticket.html';
import './submit.html';
import './ticket.html';
import './ticketview.html';

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
  } else Router.go('/');
});

Router.route('/add', function () {
  if (Meteor.userId()) {
    this.render('submit');
  } else this.render('loginButtons');
});

Router.route('/admin', function () {
  if (Meteor.userId()) this.render('admin');
  else this.render('loginButtons');
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

Template.singleticket.rendered = function () {
  $(document).ready(function () {
    setTimeout(function () {
      if ($('body').find('h1').text() === '') {
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
    const numtofind = parseInt($(target).parent().parent().parent()
      .parent()
      .find('.ticketnum')
      .text(), 10);
    const doc = Tickets.findOne({ number: numtofind });  // change me
    Tickets.update({ _id: doc._id }, { $set: { status: 'resolved' } });
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
    const youremail = target.youremailin.value;
    const rpiemail = target.rpiemailin.value;
    const issuetype = target.issuetype.value;
    const status = 'new-ticket';
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
      createdAt: new Date(),
    });

    Router.go('/view');
  },
});
