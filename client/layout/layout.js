Template.registerHelper('initCards', (string) => {
  return string.toUpperCase();
});

Template.layout.viewmodel({
  notDocumentsRoute: function(){
    return !Router.current().url.includes("editSortable");
  }
});
