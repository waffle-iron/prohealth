function match(marketerName, fromDate, toDate){
  let match = {};
  match.marketer = { $eq: marketerName };
  match.chartStatus = { $ne: null };
  match.referalDate = {
    $gte: fromDate,
    $lte: toDate
  };
  // match.$or = [
  //       { "chartStatus": 'Admitted' },
  //       { "chartStatus": 'Pre-Admit W/O Con' },
  //       { "chartStatus": 'Pre-Admit' },
  //       { "chartStatus": 'Pre-Recert' },
  //       { "chartStatus": 'Recert' },
  //       { "chartStatus": 'Transferred' },
  //       { "chartStatus": 'Resumption' },
  //       { "chartStatus": 'Discharge W/O CON' },
  //       { "chartStatus": 'D/C W/O PPW' },
  //       { "chartStatus": 'Discharge'},
  //     ];

  return { $match: match };
}

function level1_Projection(){
  let project = {
    referalDate: true,
    primaryInsurance: true,
    week: { $week: "$referalDate" },
    month: { $month: "$referalDate" },
    year: { $year: "$referalDate" }
  };

  project.medicareCondition = {
    $or: [
      { $eq: [ "$primaryInsurance", "Medicare Home Health" ] },
      { $eq: [ "$primaryInsurance", "Hospice Medicare" ] }
    ]
  };

  project.privateCondition = {
    $and: [
      { $ne: [ "$primaryInsurance",  "Medicare Home Health" ]},
      { $ne: [ "$primaryInsurance", "Hospice Medicare" ]}
    ]
  };

  return { $project: project };
}

function level1_Group(groupBy){
  let group = {
    _id: {insurance: "$primaryInsurance", referalDate: "$"+(groupBy=='day'? 'referalDate' : groupBy)},
    totalMedicare: {$sum: {$cond: ["$medicareCondition", 1, 0]}},
    totalPrivate: {$sum: {$cond: ["$privateCondition", 1, 0]}},
    total: {$sum: 1}
  };

  return { $group: group };
}

function level2_Group(){
  let group = {
    _id: "$_id.insurance",
    totalAdmitted: {$sum:"$total"},
    admits: {
      $push: {
        date: "$_id.referalDate",
        total: "$total",
        totalPrivate: {$sum: "$totalPrivate"},
        totalMedicare: {$sum: "$totalMedicare"},
      }
    },
  };

  return { $group: group };
}

Meteor.publish('marketerSalesData', function(marketerName, fromDate, toDate, insurance, business, groupBy){
  let pipeline = [];
  let options = {};

  pipeline.push(match(marketerName, fromDate, toDate));
  pipeline.push(level1_Projection());
  pipeline.push(level1_Group(groupBy));
  pipeline.push(level2_Group());

  options.clientCollection = "marketerSalesData";

  ReactiveAggregate(this, Patients, pipeline, options);
});
