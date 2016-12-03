// Import and initialize database

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Tickets = new Mongo.Collection('tickets');

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
      comments,
      createdAt: new Date(),
    });
  },
  'tickets.comment'(numtofind, body, author) {
    const ticket = Tickets.findOne({ number: numtofind }); // get the actual ticket
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
});
