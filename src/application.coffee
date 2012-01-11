root = exports ? this

$(document).ready ->
  NONE_URL="/images/none.png"
  id=1000

  LineViewModel = (line= {source: "",rendered_in_html:"(Empty Line)"}) ->  # parameter is PARSED line
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
    zappend_line: (my_model, event) ->
      console.log "append_line"
      return true
    insert_line: (my_model, event) ->
      console.log "insert_line"
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
        this.rendered_in_html("(empty line)<br/><br/><br/><br/>")
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
  composition = (key, doremi_script) ->
    console.log "composition-local storage",doremi_script
    @key = key
    #@composition_doremi_script = doremi_script
    ary= /Title: ([^\n]+)\n/.exec(doremi_script)
    @title=ary[1]
    this
  compositions=[]
  ctr=0
  if localStorage.length > 0
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
  
  initialData = """
  Title: sample_composition
  id: 1326030518658
  
    .
  | S - - - |
  
  | R - - - |
    hi
  
  """
 
  handleFileSelect = (evt) =>
    # Handler for file upload button(HTML5)
    file = document.getElementById('file').files[0]
    reader=new FileReader()
    reader.onload =  (evt) ->
      window.the_composition.my_init(evt.target.result)
      window.the_composition.open_file_visible(false)
    reader.readAsText(file, "")

  document.getElementById('file').addEventListener('change', handleFileSelect, false)


  window.CompositionViewModel = (my_doremi_script_source) ->
    self = this
    my_compositions=compositions
    self.selected_composition = ko.observable() # nothing selected by default
    self.composition_parse_tree_text=ko.observable("")
    self.doremi_script_source= ko.observable(my_doremi_script_source)
    self.open_file_visible=ko.observable(false)
    self.composition_info_visible=ko.observable(false)
    self.composition_parse_failed=ko.observable(false)
    self.calculate_stave_width=() ->
      "#{$('div.composition_body').width()-50}px"

    self.composition_stave_width= ko.observable(self.calculate_stave_width())

    self.composition_lilypond_source_visible=ko.observable(false)
    self.composition_lilypond_output_visible=ko.observable(false)
    self.composition_lilypond_output=ko.observable(false)
    self.doremi_script_source_visible=ko.observable(false)
    self.composition_handle_resize= (my_model) ->
      console.log "handle_resize"

    self.toggle_open_file_visible = () ->
      self.open_file_visible(!self.open_file_visible())
    self.toggle_staff_notation_visible = () ->
      self.staff_notation_visible(!self.staff_notation_visible())

    self.toggle_composition_lilypond_source_visible = () ->
      self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible())

    self.parse_composition = () ->
      self.refresh_doremi_script_source()
      try
        obj=DoremiScriptParser.parse(this.doremi_script_source())
        #this.rendered_in_html(line_to_html(result))
        self.composition_parse_tree_text("Parsing completed with no errors \n"+JSON.stringify(result,null,"  "))
        self.composition_parse_failed(false) # TODO: review
        #dom_fixes()
      catch err
        result="failed"
        self.composition_parse_failed(true)
        self.composition_parse_tree_text("Parsing failed")
        #this.rendered_in_html("<pre>Didn't parse\n\n#{this.source}</pre>")
      finally
        this.last_value_rendered=this.source

    self.toggle_doremi_script_source_visible = () ->
      self.doremi_script_source_visible(!self.doremi_script_source_visible())
      if self.doremi_script_source_visible()
        self.doremi_script_source(self.get_doremi_script_source())

    self.toggle_composition_info_visible = () ->
      self.composition_info_visible(!self.composition_info_visible())
      
    self.id=ko.observable("")
    self.raga=ko.observable("")
    self.author=ko.observable("")
    self.staff_notation_visible=ko.observable(false)
    self.source=ko.observable("") # IE AAK
    self.filename=ko.observable("")
    self.time_signature=ko.observable("")
    self.notes_used=ko.observable("")
    self.title=ko.observable("")
    self.generating_staff_notation=ko.observable(false)
    self.composition_lilypond_source=ko.observable("")
    self.parsed_doremi_script=ko.observable()
    self.staff_notation_url=ko.observable(NONE_URL)
    self.keys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"]
    self.key= ko.observable("")
    self.modes=["Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"]
    self.mode= ko.observable("")
    self.lines = ko.observableArray([])

    self.generate_staff_notation = (my_model) ->
      self.generating_staff_notation(true)
      url='http://localhost:9292/lilypond_to_jpg'
      console.log "generate_staff_notation"
      self.refresh_composition_lilypond_source()
      self.staff_notation_url(NONE_URL)
      lilypond_source=self.composition_lilypond_source() 
      console.log "lilypond_source",lilypond_source
      my_data =
        fname: "composition_#{self.id()}"
        lilypond: lilypond_source
        doremi_script_source: "" #self.refresh_doremi_script_source()
      console.log 'my_data',my_data
      obj=
        dataType : "jsonp",
        timeout : 10000
        type:'GET'
        url:'http://localhost:9292/lilypond_to_jpg'
        data: my_data
        error: (some_data) ->
          alert("Couldn't connect to staff notation generator server at #{url}")
          self.generating_staff_notation(false)
          self.staff_notation_url(NONE_URL)
        success: (some_data,text_status) ->
          self.generating_staff_notation(false)
          self.composition_lilypond_output(some_data.lilypond_output)
          if some_data.error
            self.staff_notation_url(NONE_URL)
            self.composition_lilypond_output_visible(true)
            return
          self.staff_notation_url(some_data.fname)
          self.staff_notation_visible(true)
          self.composition_lilypond_output_visible(false)
      console.log 'obj',obj
      $.ajax(obj)
      return true

    self.parse = (doremi_script_source_param) ->
      ret_val=null
      try
        ret_val=DoremiScriptParser.parse(doremi_script_source_param)
      catch err
        console.log err
        ret_val=null
      finally
      ret_val

    self.my_init = (doremi_script_source_param) ->
      console.log("Entering CompositionViewModel.init, source is",doremi_script_source_param)
      self.available_compositions = ko.observableArray(my_compositions)
      parsed=self.parse(doremi_script_source_param)
      if !parsed
        alert("Something bad happened, parse failed")
        return
      this.parsed_doremi_script(parsed)
      if !parsed.id?
        parsed.id=new Date().getTime()
      keys = [
        "id"
        "filename"
        "raga"
        "author"
        "source"
        "time_signature"
        "notes_used"
        "title"
        "key"
        "mode"
      ]
      self[key](parsed[key]) for key in keys
      self.lines(ko.utils.arrayMap(parsed.lines, LineViewModel))
      this.parsed_doremi_script(parsed) 

    self.add_line = () ->
      self.lines.push(x=new LineViewModel())
      x.parse()
      ko.applyBindings(x)

    self.re_index_lines = () ->
      ctr=0
      line.index(ctr++) for line in self.lines()
      
    self.composition_insert_line= (line_model, event) ->
      console.log "insert_line"
      index=line_model.index()
      number_of_elements_to_remove=0
      self.lines.splice(index,number_of_elements_to_remove,new LineViewModel())
      self.re_index_lines()
      return true

    self.composition_append_line= (line_model, event) ->
      index=line_model.index()
      number_of_elements_to_remove=0
      self.lines.splice(index+1,number_of_elements_to_remove,new LineViewModel())
      self.re_index_lines()
      return true

    self.remove_line = (line) ->
      res=confirm("Are you sure?")
      return if !res
      self.lines.remove(line)

    self.composition_select= (my_model,event) ->
      # User clicked on the locally saved compositions select list
      # Load from local storage
      #
      # Loads the composition selected from the local storage select list
      return if !this.selected_composition()
      key=this.selected_composition().key
      self.composition_info_visible(true)

      self.load_locally(key)

    self.refresh_doremi_script_source = (my_model) ->
      self.doremi_script_source(self.get_doremi_script_source())

    self.refresh_composition_lilypond_source = (my_model) ->
      console.log("refresh_composition_lilypond_source")
      result1=self.parsed_doremi_script()
      console.log result1
      self.composition_lilypond_source(window.to_lilypond(self.parsed_doremi_script()))

    self.new_composition = () ->
      #if confirm("Save current composition?")
      #  self.save_locally()
      initialData = """
      Title: Untitled
      id: #{new Date().getTime()}

      |S
      """
      window.the_composition.my_init(initialData)
      self.add_line()
      
    self.load_locally = (key) ->
      if key is "composition_#{window.the_composition.id()}"
        alert("This is the file you are currently editing")
        return
      source=localStorage[key]
      window.the_composition.my_init(source)

    self.get_doremi_script_source = () ->
      ignore=[
        "lilypond"
        "composition_lilypond_source"
        "composition_lilypond_source_visible"
        "doremi_script_source"
        "doremi_script_source_visible"
        "available_compositions"
        "selected_composition"
        "keys"
        "modes"
        "lines"
        "composition_info_visible"
      ]
      json_str=JSON.stringify(ko.toJS(self), null, 2)
      json_object = $.parseJSON(json_str)
      # attributes don't have a blank line between them
      atts= for att,value of json_object
        att="Filename" if att is "filename"
        att="Title" if att is "title"
        att="Raga" if att is "raga"
        att="Key" if att is "key"
        att="Mode" if att is "mode"
        att="Author" if att is "author"
        att="Source" if att is "source"
        att="TimeSignature" if att is "time_signature"
        continue if att in ignore
        continue if value is ""
        continue if !value
        "#{att}: #{value}"
      atts_str=atts.join("\n")
      lines=(line.source for line in self.lines())
      # lines have a blank line between them
      lines_str=lines.join("\n\n")
      atts_str+"\n\n"+lines_str
    self.save_locally = () ->
      console.log "save_locally"
      self.doremi_script_source(self.get_doremi_script_source())
      console.log('self.doremi_script_source()',self.doremi_script_source())
      localStorage.setItem("composition_#{self.id()}",self.doremi_script_source())

    self.my_init(my_doremi_script_source) if my_doremi_script_source?
    self

  window.the_composition=new CompositionViewModel()
  #fun =  (new_value) ->
  #  alert("New value is #{new_value}")
  #window.the_composition.selected_composition.subscribe(fun)
  window.the_composition.my_init(initialData)
  ko.applyBindings(window.the_composition,$('html')[0])
  
  window.timed_count = () =>
    which_line=null
    src=null
    for line in window.the_composition.lines()
      which_line=line if line.last_value_rendered isnt  line.source
      break if which_line
    if which_line?
      which_line.parse()
    t=setTimeout("timed_count()",1000)
  
  $(window).resize(() ->
    window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width())
  )
  
  window.timed_count()

