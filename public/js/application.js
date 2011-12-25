var ContactsModel, initialData;
initialData = [
  {
    source: "Danny",
    lastName: "LaRusso",
    phones: [
      {
        type: "Mobile",
        number: "(555) 121-2121"
      }, {
        type: "Home",
        number: "(555) 123-4567"
      }
    ]
  }, {
    source: "Sensei",
    lastName: "Miyagi",
    phones: [
      {
        type: "Mobile",
        number: "(555) 444-2222"
      }, {
        type: "Home",
        number: "(555) 999-1212"
      }
    ]
  }
];
ContactsModel = function(lines) {
  var fun, self;
  self = this;
  fun = function(contact) {
    return {
      source: contact.source,
      lastName: contact.lastName,
      phones: ko.observableArray(contact.phones)
    };
  };
  self.lines = ko.observableArray(ko.utils.arrayMap(lines, fun));
  self.addContact = function() {
    return self.lines.push({
      source: "",
      lastName: "",
      phones: ko.observableArray()
    });
  };
  self.removeContact = function(contact) {
    return self.lines.remove(contact);
  };
  self.addPhone = function(contact) {
    return contact.phones.push({
      type: "",
      number: ""
    });
  };
  self.removePhone = function(phone) {
    return $.each(self.lines(), function() {
      return this.phones.remove(phone);
    });
  };
  self.save = function() {
    return self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2));
  };
  self.lastSavedJson = ko.observable("");
  return self;
};
ko.applyBindings(new ContactsModel(initialData));