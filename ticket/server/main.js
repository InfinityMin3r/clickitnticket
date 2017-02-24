// Server initialization

import { Meteor } from 'meteor/meteor';
import '../imports/api/tickets.js';

Meteor.startup(() => {
  // code to run on server at startup
	var users = Meteor.users.find().fetch();
	_.each(users, function(userData){
		if (userData.emails[0].address === "chenj32@rpi.edu"){
			Roles.addUsersToRoles(userData, ['Admin']);
		}
	})

	  Meteor.publish("directory", function () {
	      return Meteor.users.find({});
	  });

});
