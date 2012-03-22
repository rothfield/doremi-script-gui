debug=false
unique_id=1000

window.LineViewModel = (line_param= {source: EMPTY_LINE_SOURCE,rendered_in_html:"(Empty Line)"}) ->  # parameter is PARSED line
  self = this
  self.line_id= ko.observable(unique_id++)

  self.index= ko.observable(line_param.index) # 0 and up
  
  self.div_line_id= ko.computed( () ->
    return "div_line_#{self.index()}"
  )
  console.log "LineViewModel" if debug
  self.line_parsed_doremi_script= ko.observable(null)
  self.line_parse_failed= ko.observable(false)
  self.line_warnings= ko.observable([])
  self.line_has_warnings= ko.observable(false)
  self.line_warnings_visible= ko.observable(false)
  self.parse_tree_visible= ko.observable(false)
  self.parse_tree_text= ko.observable("parse tree text here")
  self.editing= ko.observable(false)
  self.not_editing=ko.observable(true)
  self.last_html_rendered= ""
  self.stave_height= ko.observable("161px")
  self.source= ko.observable(line_param.source) # doremi_source for self line
  self.rendered_in_html= ko.observable(line_param.rendered_in_html)

  self.close_edit= (my_model, event) ->
    index=my_model.index()
    self.editing(false)
    self.not_editing(true)
    window.the_composition.editing_a_line(false)
    window.the_composition.not_editing_a_line(true)
    window.the_composition.last_line_opened=my_model.index()
    window.the_composition.redraw()
    $(".stave_wrapper").enableContextMenu()
    return true
  
  self.toggle_line_warnings_visible= (event) ->
    self.line_warnings_visible(!self.line_warnings_visible())
  self.toggle_parse_tree_visible= (event) ->
    self.parse_tree_visible(!self.parse_tree_visible())
    return true
  
  self.edit= (my_model,event) ->
    $(".stave_wrapper").disableContextMenu()
    return false if window.the_composition.editing_a_line()
    if (self.editing())
      return false
    for line in window.the_composition.lines()
      line.editing(false)
      line.not_editing(true) #TODO: unfunkify
    self.editing(true)
    self.not_editing(false)
    window.the_composition.editing_a_line(true)
    window.the_composition.not_editing_a_line(false)
    window.the_composition.edit_line_open(true)
    dom_id=self.entry_area_id()
    console.log("dom_id is #{dom_id}") if debug
    $("textarea#"+dom_id).focus()
    val=self.source()
    selector="textarea#"+dom_id
    $textarea=$(selector)
    $textarea.select_range(val.length,val.length)
    if ! window.elementInViewport($textarea[0])
      $.scrollTo($textarea, 500,{offset:-50})
    true
  
  self.entry_area_id= ko.observable("entry_area_#{unique_id}")
  self.stave_id= ko.observable("stave_#{unique_id}")
  self.context_menu_id= ko.observable("context_menu_#{unique_id}")
  self.handle_key_press= (current_line,event) ->
    let_default_action_proceed=true
    let_default_action_proceed
  self

Logger=_console.constructor
# _console.level  = Logger.DEBUG
_console.level  = Logger.WARN
_.mixin(_console.toObject())

 
handleFileSelect = (evt) =>
  console.log "handle_file_select" if debug
  if window.the_composition.editing_composition()
    x=confirm("Save current composition?")
    if x
      $('#file').val('')
      alert("use save button")
      return
  # Handler for file upload button(HTML5)
  file = document.getElementById('file').files[0]
  reader=new FileReader()
  reader.onload =  (evt) ->
    val=$('#file').val()
    $('#file').val('')
    console.log "onload" if debug
    # TODO: DRY and move into composition
    $('#file').val('')
    window.the_composition.last_doremi_source= new Date().getTime()
    window.the_composition.my_init(evt.target.result)
    window.the_composition.editing_composition(true)
    window.the_composition.open_file_visible(false)
    window.the_composition.help_visible(false)
    window.the_composition.composition_info_visible(false)

  reader.readAsText(file, "")

document.getElementById('file').addEventListener('change', handleFileSelect, false)
