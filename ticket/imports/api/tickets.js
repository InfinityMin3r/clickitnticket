// Import and initialize database

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Tickets = new Mongo.Collection('tickets');

Meteor.methods({
  'tickets.insert'(
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
    Tickets.insert({
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
    const arro = ticket.comments;
    const time = new Date();
    let arrnew = [{}];
    if (typeof (arro) === 'undefined') {
      arrnew = [{ author, body, time }];
    } else {
      arrnew = arro;
      arrnew.push({ author, body, time });
    }
    Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } });
  },
  'tickets.resolve'(numtofind, body, open) {
    const ticket = Tickets.findOne({ number: numtofind });
    const arro = ticket.comments;
    const author = 'System';
    const time = new Date();
    let arrnew = [{}];
    if (typeof (arro) === 'undefined') {
      arrnew = [{ author, body, time }];
    } else {
      arrnew = arro;
      arrnew.push({ author, body, time });
    }
    Tickets.update({ _id: ticket._id }, { $set: { comments: arrnew } });
    if (open) {
      Tickets.update({ _id: ticket._id }, { $set: { status: true } });
    } else {
      Tickets.update({ _id: ticket._id }, { $set: { status: false } });
    }
  },
});
