initialData = [
  { source: "| S - - - |", lastName: "LaRusso", phones: [
      { type: "Mobile", number: "(555) 121-2121" },
      { type: "Home", number: "(555) 123-4567"}]
  },
  { source: "| r - - - |", lastName: "Miyagi", phones: [
      { type: "Mobile", number: "(555) 444-2222" },
      { type: "Home", number: "(555) 999-1212"}]
  }
]
 
ContactsModel = (lines) ->
  self = this

  fun = (contact) ->
    source: contact.source
    lastName: contact.lastName
    phones: ko.observableArray(contact.phones)

  self.lines = ko.observableArray(ko.utils.arrayMap(lines, fun))

  self.addContact = () ->
    self.lines.push({
            source: "",
            lastName: "",
            phones: ko.observableArray()
        })
  self.removeContact = (contact) ->
        self.lines.remove(contact)
 
  self.addPhone = (contact) ->
    contact.phones.push({
            type: "",
            number: ""
        })
 
  self.removePhone = (phone) ->
    $.each(self.lines(), () ->  this.phones.remove(phone) )
 
  self.save = () ->
    self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2))
 
  self.lastSavedJson = ko.observable("")

  self

ko.applyBindings(new ContactsModel(initialData))
