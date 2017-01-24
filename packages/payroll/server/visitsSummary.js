Meteor.publish("visits-spreadsheet", function(fromDate, toDate, field1, field2) {
    console.log(fromDate, toDate, field1, field2);
    let match = {
        [field1]: {
            $ne: null
        },
        [field2]: {
            $ne: null
        },
        formDate: {
            $gte: moment(fromDate, "MM/DD/YYYY").utc().toDate(),
            $lte: moment(toDate, "MM/DD/YYYY").utc().toDate()
        }
    };
    console.log(match);
    let project = {
        [field1]: true,
        [field2]: true,
        amount: true,
        day: {
            $and: [{
                    $gte: ['$date', moment(toDate, "MM/DD/YYYY").utc().startOf('day').toDate()]
                },
                {
                    $lte: ['$date', moment(toDate, "MM/DD/YYYY").utc().endOf('day').toDate()]
                }
            ]
        },
        week: {
            $and: [{
                    $gte: ['$date', moment(toDate, "MM/DD/YYYY").utc().startOf('week').toDate()]
                },
                {
                    $lte: ['$date', moment(toDate, "MM/DD/YYYY").utc().endOf('week').toDate()]
                }
            ]
        }
    };
    console.log(project);
    let field1ag = "$" + field1;
    let field2ag = "$" + field2;
    ReactiveAggregate(this,
        Visits, [{
                $match: match
            },
            {
                $project: project
            },
            {
                $group: {
                    _id: {
                        field1ag,
                        field2ag
                    },
                    months: {
                        $sum: 1
                    },

                    monthsTotal: {
                        $sum: "$cost"
                    },
                }
            },
            {
                $sort: {
                    months: -1
                }
            },
            {
                $group: {
                    _id: "$_id.field1ag",
                    months: {
                        $sum: "$months"
                    },
                    monthsTotal: {
                        $sum: "$monthsTotal"
                    },
                    field2Aggregates: {
                        $push: {
                            _id: "$_id.field2ag",
                            months: "$months",
                            monthsTotal: "$monthsTotal"
                        }
                    }
                }
            },
            {
                $sort: {
                    months: -1
                }
            }
        ], {
            clientCollection: "visits-spreadsheet"
        }
    );
});
