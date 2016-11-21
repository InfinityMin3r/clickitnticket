// Import and initialize database

import { Mongo } from 'meteor/mongo';

export const Tickets = new Mongo.Collection('tickets');
