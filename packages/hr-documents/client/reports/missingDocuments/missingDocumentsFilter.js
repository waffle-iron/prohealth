let Utils = {};
Utils.collection_options = function(Collection, field) {
    return Collection.find().map(function(model) {

        return {
            id: model["_id"],
            name: model[field]
        }
    })
}
Template.missingDocumentsFilter.viewmodel({
    active: 'true',
    name_query: '',
    state: '',
    job: '',
    agency: '',
    area: '',
    availability: '',
    currentFilter: function() {
        let currentFilter = {

            missing_documents_ids: {
                $exists: true,
                $not: {
                    $size: 0
                }
            }

        };
        if (this.name_query()) {
            currentFilter.name = {
                '$regex': '.*' + this.name_query() + '.*',
                '$options': 'i'
            };
        };
        // if (this.state()) {
        //     currentFilter.state = this.state();
        // };

        if (this.job()) {
            currentFilter.job_id = this.job();
        };

        if (this.agency()) {
            currentFilter.agencies = this.agency();
        };

        if (this.area()) {
            currentFilter.areas = this.area();
        };

        if (this.availability()) {
            currentFilter.availabilities = this.availability();
        }
        if (this.active() && (this.active() === 'true')) {
            currentFilter.active = true;
        }
        return currentFilter;
    },
    filterChange: function() {
        // console.log("don't debounce ");
        console.log("Filter from docs");
        console.log(this.currentFilter());
        agentsMissingDocuments.set({
            filters: this.currentFilter(),
        });
        // agentsMissingDocuments.reload();
    },
    autorun: function() {
      //subscribe to agents
        var subscription = this.templateInstance.subscribe("agents", this.currentFilter());
        if (subscription.ready())
            agentsMissingDocuments.reload();

        if (this.currentFilter()) {
          agentsMissingDocuments.set({
              filters: this.currentFilter(),
          });
            agentsMissingDocuments.reload();
        }
        // if (Object.keys(this.currentFilter()).length > 1) {
        //     Session.set("agentsFilter", this.currentFilter());
        // }

    },
    nameChange:  _.throttle(function() {
        if (searchByName) {
            if (!backspace) {
                agentsMissingDocuments.set({
                    filters: this.currentFilter(),
                });
            } else{
              var filter = this.currentFilter();
                  delete filter.name;
                  agentsMissingDocuments.set({
                      filters: filter,
                  });
            }
        }
        else{
          var fltr = this.currentFilter();
              delete fltr.name;
              agentsMissingDocuments.set({
                  filters: fltr,
              });
        }
        // console.log("throttle");
        agentsMissingDocuments.reload();
        // console.log($("#nameField").val());
        // console.log(  agentsPages.filters);
        // if (Object.keys(this.currentFilter()).length > 1) {
        //     Session.set("agentsFilter", this.currentFilter());
        // }
    }, 1000),

    jobs_options: function() {
        return Utils.collection_options(Jobs, "name");
    },
    agencies_options: function() {
        return Utils.collection_options(Agencies, "name");
    },
    areas_options: function() {
        return Utils.collection_options(Areas, "name");
    },
    availabilities_options: function() {
        return Utils.collection_options(Availabilities, "name");
    },
    agent_states_options: function() {
        return Utils.collection_options(AgentStates, "name");
    },
    onCreated: function() {
        //  agentsMissingDocuments.set({
        //     filters: this.currentFilter(),
        //  });
        if (Session.get("agentsFilter")) {
            console.log(Session.get("agentsFilter"));
            var filter = Session.get("agentsFilter");
            if (filter.job_id) {
                // console.log(filter.job_id);
                this.job(filter.job_id);
            }
            if (filter.agencies) {
                this.agency(filter.agencies);
            }
            if (filter.areas) {
                this.area(filter.areas);
            }
            if (filter.availabilities) {
                this.availability(filter.availabilities);
            }
            if (filter.active) {
                this.active(filter.active);
            }
            if (filter.name) {
                var name_q = filter.name.$regex;
                this.name_query(name_q.substring(2,name_q.length-2));
            }
            console.log(this.currentFilter());
            agentsMissingDocuments.set({
                filters: this.currentFilter(),
            });
            agentsMissingDocuments.reload();
        }
    },
    onRendered: function() {
      Materialize.updateTextFields();
      if($("select.initialized").length==0)
        $("select").material_select();
      agentsMissingDocuments.reload();
    },
    events: {
        "focus #nameField": function() {
            isEditingName = true;
            // console.log(isEditingName);
        },
        "blur #nameField": function() {
            isEditingName = false;
            // console.log(isEditingName);
        },
        "input #nameField": function(e) {
            backspace = false;
            if (e.target.value.length > 2) {
                searchByName = true;
            } else {
                if (preLength == 3) {
                    // console.log("backspace");
                    backspace = true;
                    searchByName = true;
                } else
                    searchByName = false;
            }
            // console.log("search by name");
            // console.log(searchByName);
            preLength = e.target.value.length;
        },
        "click #clear-filters": function(e){
          this.active("true");
          this.name_query("");
          this.state("");
          this.job("");
          this.agency("");
          this.area("");
          this.availability("");
          $(".filter .select-wrapper input").val("Select");
          $(".filter .active-only input").val("Active Only");
          Session.set("filterHasEntries", false);

          agentsExpiringDocuments.set({
              filters: this.currentFilter(),
          });
          agentsExpiringDocuments.reload();
          setTimeout(function () {
            if($("select.initialized").length==0)
              $("select").material_select();
          }, 10);
        }
    }
});
