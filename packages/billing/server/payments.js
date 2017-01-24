Meteor.publish("payments-spreadsheet", function (start_date, end_date, field1, field2) {
  console.log(start_date, end_date, field1, field2);
  ReactiveAggregate(this, Bills, [
    { $match:
      {
        [field1.substr(1)]: { $ne: null },
        [field2.substr(1)]: { $ne: null },
        date: { $gte : start_date, $lte: end_date }
      }
    },
    { $project:
      {
        [field1.substr(1)]: true,
        [field2.substr(1)]: true,
        amount: true,
        today: {
          $and: [
            { $gte: [ '$date', moment(date).startOf('day')._d ] },
            { $lte: [ '$date', moment(date).endOf('day')._d ] }
          ]
        }
      }
    },

  ], { clientCollection: 'payments-spreadsheet' });
});
