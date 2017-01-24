let Utils = {};
Utils.collection_options = function(Collection, field) {
    return Collection.find().map(function(model) {
        return {
            id: model["_id"],
            name: model[field]
        }
    })
}

Template.emergencyListFilter.viewmodel({
    active: 'true',
    name_query: '',
    state: '',
    job: '',
    agency: '',
    area: '',
    availability: '',
    //search by name helpers
    isEditingName: false,
    backspace: false,
    searchByName: false,
    prelength: 0,
    // end search by name helpers
    currentFilter: function() {
        let currentFilter = {};
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
        if (this.active() && this.active() === 'true') {
            currentFilter.active = true;
        }
        return currentFilter;
    },
    filterChange: function() {
        // console.log("don't debounce ");
        console.log("Filter from AGents");
        console.log(this.currentFilter())
        agentsEmergencyList.set({
            filters: this.currentFilter(),
        });
        // agentsEmergencyList.reload();
    },
    autorun: function() {
      //subscribe to agents
        var subscription = this.templateInstance.subscribe("agents", this.currentFilter());
        if (subscription.ready())
            agentsEmergencyList.reload();

        console.log(this.currentFilter());
        if (this.currentFilter()) {
            agentsEmergencyList.reload();
            // Session.set("agentsFilter", {});
        }
        // if (Object.keys(this.currentFilter()).length > 1) {
        Session.set("agentsFilter", this.currentFilter());
        // }
        console.log("autorun");
        if (!isEditingName) {
            if (this.currentFilter()) {
                agentsEmergencyList.set({
                    filters: this.currentFilter(),
                });
                Meteor.setTimeout(function() {
                    agentsEmergencyList.reload();
                }, 500);
            }
        } else {
            if (searchByName) {
                agentsEmergencyList.reload();
                console.log("here");
            }
        }
    },
    nameChange: _.throttle(function() {
        if (searchByName) {
            if (!backspace) {
                agentsEmergencyList.set({
                    filters: this.currentFilter(),
                });
            } else {
                var filter = this.currentFilter();
                delete filter.name;
                agentsEmergencyList.set({
                    filters: filter,
                });
            }
        } else {
            var fltr = this.currentFilter();
            delete fltr.name;
            agentsEmergencyList.set({
                filters: fltr,
            });
        }
        // console.log("throttle");
        agentsEmergencyList.reload();
        // console.log($("#nameField").val());
        // console.log(  agentsEmergencyList.filters);
        if (Object.keys(this.currentFilter()).length > 1) {
            Session.set("agentsFilter", this.currentFilter());
        }
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
        // agentsEmergencyList.set({
        //     filters: this.currentFilter(),
        // });
        if (Session.get("agentsFilter")) {
            // console.log(Session.get("agentsFilter"));
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
                this.availability(filter.availabilitiess);
            }
            if (filter.active) {
                this.active('true');
            } else {
                this.active('false');
            }
            if (filter.name) {
                var name_q = filter.name.$regex;
                this.name_query(name_q.substring(2, name_q.length - 2));
            }
            console.log(this.currentFilter());
            agentsEmergencyList.set({
                filters: this.currentFilter(),
            });
            agentsEmergencyList.reload();
        }

    },

    onRendered: function() {
        Materialize.updateTextFields();
        agentsEmergencyList.reload();
        if($("select.initialized").length==0)
        $("select").material_select();
    },
    events: {
        "focus #nameField": function() {
            isEditingName = true;
            console.log(isEditingName);
        },
        "blur #nameField": function() {
            isEditingName = false;
            console.log(isEditingName);
        },
        "input #nameField": function(e) {
            backspace = false;
            if (e.target.value.length > 2) {
                searchByName = true;
            } else {
                if (preLength == 3) {
                    console.log("backspace");
                    backspace = true;
                    searchByName = true;
                } else
                    searchByName = false;
            }
            console.log("search by name");
            console.log(searchByName);
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

          agentsEmergencyList.set({
              filters: this.currentFilter(),
          });
          agentsEmergencyList.reload();
          setTimeout(function () {
            if($("select.initialized").length==0)
              $("select").material_select();
          }, 10);
        }
    }
});
