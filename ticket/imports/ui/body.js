import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tickets } from '../api/tickets.js';

import './body.html';

Router.route('/', function(){
	this.render('ticketview');
});

Router.route('/add', function(){
	this.render('submit');
});

Router.route('/admin', function(){
    if ( Meteor.userId() ) this.render('admin');
    else this.render('loginButtons');
});

Template.ticketview.helpers({
	tickets() {
		return Tickets.find({}, { sort: { createdAt: -1 } });;
	},
});

Template.ticketview.events({
	'click .ticket-list .tbtn': function(event){
		const target = event.target;
		$(target).parent().parent().parent().find("ul").toggle();
	}
});

Template.submit.onCreated(function submitOnCreated(){
	//variable to keep track of final priority value
	this.prioritysel = new ReactiveVar("D");
	this.priorityclass = new ReactiveVar("btn-info");
});

Template.submit.helpers({
	prioritysel() {
		return Template.instance().prioritysel.get();
	},
	priorityclass() {
		return Template.instance().priorityclass.get();
	}
});

Template.submit.events({
	'click .pri-btn': function(event) {
		event.preventDefault();
		const target = event.target;
		const val = target.innerHTML;
		if (val == "Priority A"){
			Template.instance().prioritysel.set("A");
			Template.instance().priorityclass.set("btn-danger");
		}
		else if (val == "Priority B"){
			Template.instance().prioritysel.set("B");
			Template.instance().priorityclass.set("btn-warning");
		}
		else if (val == "Priority C"){
			Template.instance().prioritysel.set("C");
			Template.instance().priorityclass.set("btn-primary");
		}
		else if (val == "Priority D"){
			Template.instance().prioritysel.set("D");
			Template.instance().priorityclass.set("btn-info");
		}
	},
	'click #finalpriority': function(event){
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
		const status = "new-ticket";
		if (description == "" || priority == "" || youremail == "" || rpiemail == "" || issuetype == ""){
			alert("Something wasn't set, try again!");
			return false;
		}
		Tickets.insert({
			description,
			youremail,
			rpiemail,
			issuetype,
			priority,
			status,
			createdAt: new Date(),
		});

		//target.titleinput.value = "";
		//target.bodyinput.value = "";
		Router.go('/');
	},
});
