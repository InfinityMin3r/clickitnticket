Template.users.helpers({
  user: function() {
    var user = Meteor.users.find();

    if ( user ) {
      return user;
    }
  },
});