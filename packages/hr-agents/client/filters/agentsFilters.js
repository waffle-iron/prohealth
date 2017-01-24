let Utils = {};
Utils.collection_options = function(Collection, field) {
    return Collection.find().map(function(model) {
        return {
            id: model["_id"],
            name: model[field]
        };
    });
};

Template.agentsFilters.viewmodel({
    active: "true",
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
    // end search ny name helpers

    currentFilter: function() {
        let currentFilter = {};
        // console.log(this.name_query());
        if (this.name_query().length>2) {
            currentFilter.name = {
                '$regex': '.*' + this.name_query() + '.*',
                '$options': 'i'
            };
        }

        if (this.job()) {
            currentFilter.job_id = this.job();
        }

        if (this.agency()) {
            currentFilter.agencies = this.agency();
        }

        if (this.area()) {
            currentFilter.areas = this.area();
        }

        if (this.availability()) {
            currentFilter.availabilities = this.availability();
        }
        if (this.active() && (this.active() === "true")) {
            currentFilter.active = true;
        }
        return currentFilter;
    },

    autorun: function() {
      //subscribe to agents

        console.log(this.currentFilter());
        // if (!(Object.keys(this.currentFilter()).length == 1 && _.has(this.currentFilter(), 'active'))) {
            Session.set("agentsFilter", this.currentFilter());
        // }

        if (!this.isEditingName()) {
            if (this.currentFilter()) {
                Session.set("agentsFilter", this.currentFilter());
            }
        } else {
            if (this.searchByName()) {
                Session.set("agentsFilter", this.currentFilter());
            }
        }
        // SET FILTERHASENTRIES FOR PAGES TEMPLATE
        if ((Object.keys(this.currentFilter()).length == 1 && _.has(this.currentFilter(), 'active')) || Object.keys(this.currentFilter()).length < 1) {
          Session.set("filterHasEntries", false);
        } else if(!this.searchByName() && Object.keys(this.currentFilter()).length == 2 && _.has(this.currentFilter(), 'name')){
          Session.set("filterHasEntries", false);
        } else {
          Session.set("filterHasEntries", true);
        }
        // END SET FILTERHASENTRIES FOR PAGES TEMPLATE
        // var subscription = this.templateInstance.subscribe("agents", this.currentFilter());

    },
    nameChange: _.throttle(function() {
        if (this.searchByName()) {
            if (!this.backspace()) {
                Session.set("agentsFilter", this.currentFilter());
            } else {
                var filter = this.currentFilter();
                 this.currentFilter(filter)
                delete filter.name;
                Session.set("agentsFilter", filter);
            }
        } else {
            var filt = this.currentFilter();
            delete filt.name;
            this.currentFilter(filt);
            Session.set("agentsFilter", filt);
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
    updateFilters: function(){

    },
    onCreated: function() {
      if (Session.get("agentsFilter")) {
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
              this.active("true");
          }else{
            this.active("false");
          }
          if (filter.name) {
              var name_q = filter.name.$regex;
              this.name_query(name_q.substring(2, name_q.length - 2));
          }
          Session.set("agentsFilter", this.currentFilter());
      }
    },
    onRendered: function() {
      Materialize.updateTextFields();
      $("select").material_select();
    },
    events: {
        "focus #nameField": function() {
            isEditingName = true;
        },
        "blur #nameField": function() {
            isEditingName = false;
        },
        "input #nameField": function(e) {
            this.backspace(false);
            if (e.target.value.length > 2) {
                this.searchByName(true);
            } else {
                if (preLength == 3) {
                    // console.log("backspace");
                    this.backspace(true);
                    this.searchByName(false);
                } else
                    this.searchByName(false);
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

          Session.set("agentsFilter", this.currentFilter());
          setTimeout(function () {
            if($("select.initialized").length==0)
              $("select").material_select();
          }, 10);
        }
    }
});
