AccountsTemplates.addField({
  _id: 'name',
  type: 'text',
  required: true,
});

AccountsTemplates.configure({
    enablePasswordChange: true,
});
