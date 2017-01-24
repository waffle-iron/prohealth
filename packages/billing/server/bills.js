Meteor.publish("bills-stats", function(fromDate, toDate) {
    ReactiveAggregate(this, Bills, [{
            $match: {
                date: {
                    $gte: moment(fromDate)._d,
                    $lte: moment(toDate)._d
                }
            }
        },

        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y/%m/%d",
                        date: "$date"
                    }
                },
                y: {
                    $sum: "$amount"
                },

            }
        },
        {
            $sort: {
                _id: 1
            }
        },
    ], {
        clientCollection: 'bills-stats'
    });
});

Meteor.publish('recievables-spreadsheet', function(fromDate, toDate, payment, field1, field2) {
    console.log(payment, "payment")
    ReactiveAggregate(this, Bills, [{
            $match: {

                paymentsAmount: {
                    [payment]: 0
                },
                [field1.substr(1)]: {
                    $ne: null
                },
                [field2.substr(1)]: {
                    $ne: null
                },
                date: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }
        },
        {
            $project: {
                date: true,
                [field1.substr(1)]: true,
                [field2.substr(1)]: true,
                remain: {
                    $subtract: ['$amount', '$paymentsAmount']
                },
                _00: {
                    $and: [{
                            $lte: ['$date', moment(toDate).subtract(00, 'days')._d]
                        },
                        {
                            $gte: ['$date', moment(toDate).subtract(10, 'days')._d]
                        }
                    ]
                },
                _11: {
                    $and: [{
                            $lte: ['$date', moment(toDate).subtract(11, 'days')._d]
                        },
                        {
                            $gte: ['$date', moment(toDate).subtract(20, 'days')._d]
                        }
                    ]
                },
                _21: {
                    $and: [{
                            $lte: ['$date', moment(toDate).subtract(21, 'days')._d]
                        },
                        {
                            $gte: ['$date', moment(toDate).subtract(30, 'days')._d]
                        }
                    ]
                },
                _31: {
                    $and: [{
                            $lte: ['$date', moment(toDate).subtract(31, 'days')._d]
                        },
                        {
                            $gte: ['$date', moment(toDate).subtract(60, 'days')._d]
                        }
                    ]
                },
                _61: {
                    $lt: ['$date', moment(toDate).subtract(60, 'days')._d]
                }
            }
        },
        {
            $group: {
                _id: {
                    field1,
                    field2
                },
                _00c: {
                    $sum: {
                        $cond: ['$_00', 1, 0]
                    }
                },
                _00a: {
                    $sum: {
                        $cond: ['$_00', '$remain', 0]
                    }
                },
                _11c: {
                    $sum: {
                        $cond: ['$_11', 1, 0]
                    }
                },
                _11a: {
                    $sum: {
                        $cond: ['$_11', '$remain', 0]
                    }
                },
                _21c: {
                    $sum: {
                        $cond: ['$_21', 1, 0]
                    }
                },
                _21a: {
                    $sum: {
                        $cond: ['$_21', '$remain', 0]
                    }
                },
                _31c: {
                    $sum: {
                        $cond: ['$_31', 1, 0]
                    }
                },
                _31a: {
                    $sum: {
                        $cond: ['$_31', '$remain', 0]
                    }
                },
                _61c: {
                    $sum: {
                        $cond: ['$_61', 1, 0]
                    }
                },
                _61a: {
                    $sum: {
                        $cond: ['$_61', '$remain', 0]
                    }
                },
                totalc: {
                    $sum: 1
                },
                totala: {
                    $sum: '$remain'
                }
            }
        },
        {
            $sort: {
                totalc: -1,
                totala: -1
            }
        },
        {
            $group: {
                _id: '$_id.field1',
                _00c: {
                    $sum: '$_00c'
                },
                _00a: {
                    $sum: '$_00a'
                },
                _11c: {
                    $sum: '$_11c'
                },
                _11a: {
                    $sum: '$_11a'
                },
                _21c: {
                    $sum: '$_21c'
                },
                _21a: {
                    $sum: '$_21a'
                },
                _31c: {
                    $sum: '$_31c'
                },
                _31a: {
                    $sum: '$_31a'
                },
                _61c: {
                    $sum: '$_61c'
                },
                _61a: {
                    $sum: '$_61a'
                },
                totalc: {
                    $sum: '$totalc'
                },
                totala: {
                    $sum: '$totala'
                },
                field2Aggregates: {
                    $push: {
                        _id: '$_id.field2',
                        _00c: '$_00c',
                        _00a: '$_00a',
                        _11c: '$_11c',
                        _11a: '$_11a',
                        _21c: '$_21c',
                        _21a: '$_21a',
                        _31c: '$_31c',
                        _31a: '$_31a',
                        _61c: '$_61c',
                        _61a: '$_61a',
                        totalc: '$totalc',
                        totala: '$totala'
                    }
                }
            }
        },
        {
            $sort: {
                totalc: -1,
                totala: -1
            }
        },
        {
            $group: {
                _id: 'totalRecord',
                _00c: {
                    $sum: '$_00c'
                },
                _00a: {
                    $sum: '$_00a'
                },
                _11c: {
                    $sum: '$_11c'
                },
                _11a: {
                    $sum: '$_11a'
                },
                _21c: {
                    $sum: '$_21c'
                },
                _21a: {
                    $sum: '$_21a'
                },
                _31c: {
                    $sum: '$_31c'
                },
                _31a: {
                    $sum: '$_31a'
                },
                _61c: {
                    $sum: '$_61c'
                },
                _61a: {
                    $sum: '$_61a'
                },
                totalc: {
                    $sum: '$totalc'
                },
                totala: {
                    $sum: '$totala'
                },
                totalAggregates: {
                    $push: {
                        _id: '$_id',
                        _00c: '$_00c',
                        _00a: '$_00a',
                        _11c: '$_11c',
                        _11a: '$_11a',
                        _21c: '$_21c',
                        _21a: '$_21a',
                        _31c: '$_31c',
                        _31a: '$_31a',
                        _61c: '$_61c',
                        _61a: '$_61a',
                        totalc: '$totalc',
                        totala: '$totala',
                        field2Aggregates: '$field2Aggregates'
                    }
                }
            }
        }
    ], {
        clientCollection: 'recievables-spreadsheet'
    });
});
