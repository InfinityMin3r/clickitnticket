// Import and initialize database

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Tickets = new Mongo.Collection('tickets');


if (Meteor.isServer) {
  Meteor.publish('ticketslist',function ticketPub() {
	return Tickets.find();
  });
}

Meteor.methods({
  'tickets.insert'( //secure method for insertion - take all fields from client
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
	close,
	blockComments,
	comments) {
	// Make sure the user is logged in before inserting a task
	if (!this.userId) {
	  throw new Meteor.Error('not-authorized');
	}
	Tickets.insert({ //actually insert
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
	  close,
	  blockComments,
	  comments,
	  createdAt: new Date()
	});
  },
  'tickets.comment'(numtofind, body, author) {
	// console.log("number is ",numtofind);

	const ticket = Tickets.findOne({ number: numtofind }); // get the actual ticket
	console.log("tickets is ", ticket);
	const arro = ticket.comments; //get the existing comments
	const time = new Date(); //current time
	let arrnew = [{}];
	if (typeof (arro) === 'undefined') { //if no existing comments
	  arrnew = [{ author, body, time }]; //compose new comment
	} else { //there are existing comments
	  arrnew = arro; //copy old array
	  arrnew.push({ author, body, time }); //push new comment to array
	}
	Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } }); //update comments array to new comments array
  },
  'tickets.resolve'(numtofind, body, open) { //function to resolve or reopen a ticket
	const ticket = Tickets.findOne({ number: numtofind }); //find ticket
	const arro = ticket.comments; //get existing comments
	const author = 'System'; //these comments are authored by System
	const time = new Date(); //current time
	let arrnew = [{}];
	if (typeof (arro) === 'undefined') { //if no existing comments
	  arrnew = [{ author, body, time }]; //compose new comment
	} else { //else comments already exist
	  arrnew = arro; //copy comments
	  arrnew.push({ author, body, time }); //add new comment to array
	}
	Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } }); //update comments array with new one
	if (open) { //if reopening
	  Tickets.update({ _id: ticket._id }, { $set: { status: true } }); //set status to open
	} else { //if resolving
	  Tickets.update({ _id: ticket._id }, { $set: { status: false } }); //set status to resolved
	}
  },
  'tickets.close'(numtofind, body, close) {
	const ticket = Tickets.findOne({ number: numtofind }); //find ticket
	const arro = ticket.comments; //get existing comments
	const author = 'System'; //these comments are authored by System
	const time = new Date(); //current time
	let arrnew = [{}];
	if (typeof (arro) === 'undefined') { //if no existing comments
	  arrnew = [{ author, body, time }]; //compose new comment
	} else { //else comments already exist
	  arrnew = arro; //copy comments
	  arrnew.push({ author, body, time }); //add new comment to array
	}
	Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } }); //update comments array with new one
	if (close) { //if reopening
	  Tickets.update({ _id: ticket._id }, { $set: { close: true } }); //set status to close
	} else { //if resolving
	  Tickets.update({ _id: ticket._id }, { $set: { close: false } }); //set status to close
	}
  },
  edit(id,roles){

	//methods that helps allow the administrator to assign roles to the users.
	//maybe need a new file to handle all the functions

	roleArr = Roles.getRolesForUser(id);

	if (roleArr.length) {
	  for (i = 0; i < roleArr.length; ++i) {
		Roles.removeUsersFromRoles(id,roleArr[i]);
	  }
	}

	if(!Roles.userIsInRole(id,roles)) {
	  Roles.addUsersToRoles(id,roles);
	} else {
	  Roles.removeUsersFromRoles(id,roles);
	}
  },
});
