// // var match = {
// //   [field1.substr(1)]: { $ne: null },
// //   [field2.substr(1)]: { $ne: null },
// //   chartStatus: { $ne: null },
// //   agency: {$in: agencies},
// //   referalDate: { $gte : moment(date,"MM/DD/YYYY").startOf('month')._d, $lte: moment(date,"MM/DD/YYYY").endOf('month')._d }
// // };
// var dates = {"$day": "$referalDate",  "$week": {"$week": "$referalDate"},  "$month": {"$month": "$referalDate"}}
// // Patients two level aggregation
// Meteor.publish("general-spreadsheet", function (match, row1, row2, col1) {
//
//
//   ReactiveAggregate(this, Patients, [
//     { $match: match },
//     { $project:
//       {
//         row1.substr(1): true,
//         row2.substr(1): true,
//
//         referalDate: true,
//         col1: "$referalDate",
//         week: { $week: "$referalDate" },
//         month: { $month: "$referalDate" },
//         year: { $year: "$referalDate" }
//       }
//     },
//     { $group:
//       {
//         _id: { row1, row2,  col1},
//         total: {$sum: 1}
//       }
//     },
//     { $sort : { total : -1 } },
//     { $group:{
//         _id: {row1: "$_id.row1", col1: "$_id.col1"},
//         total: { $sum: "$total" },
//         children: {
//           $push:{
//             _id: "$_id.row2",
//             total: "$total"
//           }
//         }
//       }
//     },
//     { $sort : { $total : -1 } },
//   {
//     $group: {
//       _id: "$_id.col1",
//       total: {$sum: "$total"},
//       children: {
//         $push:{
//           _id: "$_id.row1"
//         }
//       }
//     }
//   }
//   ], { clientCollection: "general-spreadsheet" });
//
// });
