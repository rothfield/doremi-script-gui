root = exports ? this

$(document).ready ->
  my_stave_width=$('div.composition_body').width()-50
  id=1000

  LineViewModel = (line= {source: ""}) ->  # parameter is PARSED line
    id: "#{id++}"
    parse_failed: ko.observable(false)
    parse_warnings: ko.observable(false)
    #if composition_data.warnings.length > 0
    #  $('#warnings_div').html "The following warnings were reported:<br/>"+composition_data.warnings.join('<br/>')
    parse_tree_visible: ko.observable(false)
    parse_tree_text: ko.observable("parse tree text here")
    warnings: ko.observable("")
    checkbox_name: ko.observable("checkbox_#{line.index}")
    radio_group_name: ko.observable("group_#{line.index}")
    editing: ko.observable(false)
    last_value_rendered: ""
    stave_width: ko.observable("#{my_stave_width}px")
    stave_height: ko.observable("161px")
    index: ko.observable(line.index)
    source: line.source
    #rendered_in_html: line.rendered_in_html #ko.observable(line.rendered_in_html) #line.rendered_in_html
    rendered_in_html: ko.observable(line.rendered_in_html)
    # Behaviours
    line_wrapper_click: (my_model,event) ->
      console.log "line_wrapper_click",event
      if !this.editing()
        this.editing(true)
        current_target=event.currentTarget
        text_area=$(current_target).parent().find("textarea")
        $(text_area).focus()
      return true
    close_edit: (my_model, event) ->
      console.log "close_edit"
      this.editing(false)
      dom_fixes()
      return true
    toggle_parse_tree_visible: (event) ->
      this.parse_tree_visible(!this.parse_tree_visible())
      return true
    handle_blur: (event) ->
      #this.parse()
    edit: (my_model,event) ->
      this.editing(true)
      current_target=event.currentTarget
      text_area=$(current_target).parent().find("textarea")
      $(text_area).focus()
      return true
      console.log arguments
      console.log "edit"
      console.log "this is",this
      height= $(current_target).height()
      #parent=$(event.currentTarget).parent()
      #console.log "parent",parent
      text_area=$(current_target).find("textarea")
      console.log "text_area",text_area
      #$(text_area).toggle().focus()
      $(text_area).height(height)
    line_wrapper_id: () ->
      "line_wrapper_#{this.id}"
    show_parse_tree_click: () ->
      console.log "you clicked show parse tree"
      #this.parse_tree_visible(!this.parse_tree_visible())
      false
    handle_key_press: (current_line,event) ->
      let_default_action_proceed=true
      let_default_action_proceed
    parse: () ->
      if this.source is "" or this.source is null
        this.rendered_in_html("")
        this.parse_tree_text("")
        return
      try
        result=DoremiScriptLineParser.parse(this.source)
        this.rendered_in_html(line_to_html(result))
        this.parse_tree_text("Parsing completed with no errors \n"+JSON.stringify(result,null,"  "))
        this.parse_failed(false)
        dom_fixes()
      catch err
        result="failed"
        this.parse_failed(true)
        this.parse_tree_text("Parsing failed")
        this.rendered_in_html("<pre>Didn't parse\n\n#{this.source}</pre>")
      finally
        this.last_value_rendered=this.source
  

  # use this to grab the title: 
  # ary= /title: ([^\n]+)\n/.exec(s)
  # title=ary[1]
  # Constructor for an object with two properties
  composition = (name, doremi_script) ->
    @compositionName = name
    @composition_doremi_script = doremi_script
    this
  compositions=[]
  ctr=0
  while ctr < localStorage.length
    key=localStorage.key(ctr)
    if key.indexOf("composition_") is 0
       compositions.push new composition(key,localStorage[key])
    ctr++
  console.log "compositions", compositions
  Logger=_console.constructor
  # _console.level  = Logger.DEBUG
  _console.level  = Logger.WARN
  _.mixin(_console.toObject())
  
  
  old_initialData = [
    { source: "| S - - - |", rendered_in_html: "<em>S</em>"},
    { source: "| r - - - |", rendered_in_html: "<em>r</em>"}
  ]
  
  initialData = """
  Title: test
  
    .
  | S - - - |
  
  | R - - - |
    hi
  
  """
  
  window.CompositionViewModel = (doremi_script_source) ->
    
    parsed_obj=DoremiScriptParser.parse(doremi_script_source)
    if !parsed_obj.id?
      parsed_obj.id=new Date().getTime()
    #console.log("parsed_obj is",parsed_obj)
    #console.log("parsed_obj.lines is",parsed_obj.lines)
    self = this
    self.availableCountries = ko.observableArray(compositions)
    self.selectedCountry = ko.observable() # nothing selected by default
    self.composition_info_visible=ko.observable(false)
    self.toggle_composition_info_visibility = () ->
      console.log("in toggle")
      self.composition_info_visible(!self.composition_info_visible())
    self.id=ko.observable(parsed_obj.id)
    self.raga=ko.observable("")
    self.author=ko.observable("")
    self.source=ko.observable("")
    self.filename=ko.observable(parsed_obj.filename)
    self.time_signature=ko.observable(parsed_obj.time_signature)
    self.notes_used=ko.observable(parsed_obj.notes_used)
    self.title=ko.observable(parsed_obj.title)
    self.keys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"]
    self.key= ko.observable(parsed_obj.key)
    self.modes=["Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"]
    self.mode= ko.observable(parsed_obj.mode)
    self.lines = ko.observableArray(ko.utils.arrayMap(parsed_obj.lines, LineViewModel))
  
    self.addLine = () ->
      self.lines.push(new LineViewModel())
    self.removeLine = (line) ->
      res=confirm("Are you sure?")
      return if !res
      self.lines.remove(line)
   
    self.save_locally = () ->
      ignore=[
        "keys"
        "modes"
        "lines"
        "lastSavedJson"
        "composition_info_visible"
      ]
      json_str=JSON.stringify(ko.toJS(self), null, 2)
      json_object = $.parseJSON(json_str)
      console.log("json_obj",json_object)
      atts= for att,value of json_object
        continue if att in ignore
        "#{att}: #{value}"
      all=atts.concat(line.source for line in self.lines())
      #console.log "atts",atts
      console.log("all",all)
      str=all.join("\n\n")
      console.log('str',str)
      localStorage.setItem("composition_#{self.id()}",str)
    self.save = () ->
      #self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2))
      self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2))
      #self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2))
      self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2))
   
    self.lastSavedJson = ko.observable("")
  
    self
  
  window.the_composition=new CompositionViewModel(initialData)
  ko.applyBindings(window.the_composition)
  
  window.timed_count = () =>
    which_line=null
    src=null
    for line in window.the_composition.lines()
      which_line=line if line.last_value_rendered isnt  line.source
      break if which_line
    if which_line?
      which_line.parse()
    t=setTimeout("timed_count()",1000)
  
  window.zdo_timer  =  () =>
    if !window.timer_is_on
      window.timer_is_on=1
      window.timed_count()
  
  
  window.timed_count()

