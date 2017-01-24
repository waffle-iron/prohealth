// agentsMissingDocuments = new Meteor.Pagination(Agents, {
//     itemTemplate: "missingDocumentItem",
//     perPage: 10,
//     sort: {
//         name: 1
//     },
//     filters: {
//         missing_documents_ids: {
//             $exists: true,
//             $not: { $size: 0 }
//         }
//     },
//     paginationMargin:0,
//     availableSettings: {
//         filters: true,
//         sort: true,
//         limit: true,
//         perPage: true
//     },
//     templateName: "missingDocumentsList",
//     fastRender: true,
// });
