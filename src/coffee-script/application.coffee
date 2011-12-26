initialData = [
  { source: "| S - - - |", rendered_in_html: "<em>S</em>"},
  { source: "| r - - - |", rendered_in_html: "<em>r</em>"}
]
 
LinesModel = (lines) ->
  self = this

  fun = (line) ->
    last_value_rendered: ""
    source: line.source
    #rendered_in_html: line.rendered_in_html #ko.observable(line.rendered_in_html) #line.rendered_in_html
    rendered_in_html: ko.observable(line.rendered_in_html) 

    handle_key_press: (current_line,event) ->
      let_default_action_proceed=true
      let_default_action_proceed

  self.lines = ko.observableArray(ko.utils.arrayMap(lines, fun))

  self.addLine = () ->
    self.lines.push({
            source: "",
            rendered_in_html: ""
        })

  self.removeLine = (line) ->
        self.lines.remove(line)
 
  self.save = () ->
    self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2))
 
  self.lastSavedJson = ko.observable("")

  self

window.the_lines=new LinesModel(initialData)
ko.applyBindings(window.the_lines)

window.timed_count = () =>
  found=null
  src=null
  for line in window.the_lines.lines()
    found=line if line.last_value_rendered isnt  (src=line.source)
    break if found
  if found?
    found.rendered_in_html("<em>#{src}</em>")
    found.last_value_rendered=src
  t=setTimeout("timed_count()",1000)
  return
  cur_val= $('#entry_area').val()
  if window.last_val != cur_val
    $('#run_parser').trigger('click')
    window.last_val= cur_val

window.zdo_timer  =  () =>
  if !window.timer_is_on
    window.timer_is_on=1
    window.timed_count()


window.timed_count()
