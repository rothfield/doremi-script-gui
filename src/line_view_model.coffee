debug=false
unique_id=1000

window.LineViewModel = (line_param= DoremiScriptLineParser.parse("| ")) ->
  self = this
  self.line_id= ko.observable(unique_id++)

  self.index= ko.observable(line_param.index) # 0 and up
  
  self.div_line_id= ko.computed( () ->
    return "div_line_#{self.index()}"
  )
  console.log "LineViewModel" if debug
  self.zparsed_line=ko.observable(line_param)

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

  self.revert_edit= (my_model,event) ->
    return true
  self.get_current_line_of_text_area = (obj) ->
    self.get_current_line_of(obj.value,obj.selectionStart,obj.selectionEnd)

  self.get_current_line_of = (val,sel_start,sel_end) ->
    # doesn't use dom
    # extract current line from some text given start and
    # end positions representing current section
    to_left_of_cursor=val.slice(0,sel_start)
    to_right_of_cursor=val.slice(sel_end)
    pos_of_start_of_line=to_left_of_cursor.lastIndexOf('\n')
    if pos_of_start_of_line is -1
      start_of_line_to_end=val
    else
      start_of_line_to_end=val.slice(pos_of_start_of_line+1)
    index_of_end_of_line=start_of_line_to_end.indexOf('\n')
    if index_of_end_of_line is -1
      line=start_of_line_to_end
    else
      line=start_of_line_to_end.slice(0,index_of_end_of_line)
    line

  self.handle_keypress = (my_model,event) ->
    # Note that if we return true, it means we intercepted the event
    # and that we have to manually set the source. Otherwise the textarea
    # value doesn't get saved....
    # The purpose of this code is to filter the characters as the
    # user types to make it easier to enter notes. For example, if the
    # user is entering the main line of sargam, then it is nice to automatically convert a "s" or "p" that the user types into uppercase "S" or "P".
    # For now use a primitive test to see if the user is "in" a sargam line.
    # In the future, can add feature to constrain to notes in mode or a "NotesUsed" attribute
    let_default_action_proceed=true
    console.log "in handle_keypress",my_model,event if debug
    el=event.srcElement
    val=el.value
    sel_start=el.selectionStart
    sel_end=el.selectionEnd
    to_left_of_cursor=val.slice(0,sel_start)
    to_right_of_cursor=val.slice(sel_end)
    pos_of_start_of_line=to_left_of_cursor.lastIndexOf('\n')
    if pos_of_start_of_line is -1
      start_of_line_to_end=val
    else
      start_of_line_to_end=val.slice(pos_of_start_of_line+1)
    index_of_end_of_line=start_of_line_to_end.indexOf('\n')
    if index_of_end_of_line is -1
      line=start_of_line_to_end
    else
      line=start_of_line_to_end.slice(0,index_of_end_of_line)
    line=self.get_current_line_of_text_area(el)

    do_filtering=true
    char=String.fromCharCode(event.which)
    if self.parsed_line()? and self.parsed_line().kind isnt "latin_sargam"
      do_filtering=false
    if do_filtering
      if event.which in [115,112]
         if (line.indexOf('|') > -1)
           hash=
             112:"P"
             115:"S"
           char=hash[event.which]
      console.log "debug here"
      parent=window.the_composition # TODO- add pointer to parent to line
      parent_parsed=parent.composition_parsed_doremi_script()
      if parent_parsed? and parent_parsed.force_notes_used
        hash=parent_parsed.force_notes_used_hash
        char2=hash[String.fromCharCode(event.which)]
        char= char2 || char
    event.preventDefault()
    el.value="#{to_left_of_cursor}#{char}#{to_right_of_cursor}"
    self.source(el.value)
    el.setSelectionRange(sel_start+1,sel_start+1)
    el.focus()
    true

  self.close_edit= (my_model, event) ->
    index=my_model.index()
    dom_id=self.entry_area_id()
    $textarea= $("textarea#"+dom_id)
    self.source($textarea.val()) # TODO: review
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
    # TODO: unfunkify
    window.the_composition.editing_a_line(true)
    window.the_composition.not_editing_a_line(false)
    window.the_composition.edit_line_open(true)
    dom_id=self.entry_area_id()
    $textarea= $("textarea#"+dom_id)
    self.set_edit_cursor($textarea)
    if ! window.elementInViewport($textarea[0])
      $.scrollTo($textarea, 500,{offset:-50})
    true

  self.parsed_line= ko.computed( () ->
    self.source()
    try
      DoremiScriptLineParser.parse(self.source())
    catch err
      self.line_parse_failed(true)
      self.line_has_warnings(false)
      self.line_warnings([])
      {}
  )

  self.set_edit_cursor = ($textarea) ->
    return if !$textarea?
    # set textarea cursor to right of clicked element
    # if clicked on element has data-column attribute
    # otherwise at end of line
    # Sadly won't work if there are upper attributes...
    # Could parse source to look for line that has barline at beginning...
    # Find the beginning of the main line. That'll look like
    # 1) | or | SS or maybe SrGmP
    source=self.source()
    regular_expression_to_find_line_with_barline=/^.*\|.*$/m
    result=source.match regular_expression_to_find_line_with_barline
    index=0
    if result
      index=result.index
    if event?
      column= $(event.srcElement).data("column")
    if !column? and result?
      where=index+result.input.length
    else
      where=index+ column + 1
    $textarea.select_range(where,where)
    null
 
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
