root = exports ? this

$(document).ready ->
  NONE_URL="images/none.png"
  id=1000

  message_box= (str) ->
    alert(str)

  LineViewModel = (line= {source: "",rendered_in_html:"(Empty Line)"}) ->  # parameter is PARSED line
    id: "#{id++}"

    ### TODO: make computed with throttle? ###
    line_parsed_doremi_script: ko.observable(null)

    line_parse_failed: ko.observable(false)
    line_warnings: ko.observable([])
    line_has_warnings: ko.observable(false)
    line_warnings_visible: ko.observable(false)
    parse_tree_visible: ko.observable(false)
    parse_tree_text: ko.observable("parse tree text here")
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
    
    toggle_line_warnings_visible: (event) ->
      this.line_warnings_visible(!this.line_warnings_visible())
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
      console.log "grabbing lyrics"
      composition=window.the_composition
      composition_lines=composition.lines()
      ary=[]
      for index in [0...this.index()]
        my_line=composition_lines[index]
        console.log "grabbing lyrics-line is",my_line
        if ! my_line.line_parse_failed()
          my_obj=my_line.line_parsed_doremi_script()
          ary.push my_obj if my_obj.my_type is "lyrics_section"
          console.log "grabbing lyrics-line is",my_line
      console.log "grabbing lyrics-ary is",ary
      return null if this.document?
      if this.source is "" or this.source is null
        this.rendered_in_html("(empty line)<br/><br/><br/><br/>")
        this.parse_tree_text("")
        return
      try
        result=DoremiScriptLineParser.parse(this.source)
        this.line_parsed_doremi_script(result)
        this.rendered_in_html(line_to_html(result))
        this.parse_tree_text("Parsing completed with no errors \n"+JSON.stringify(result,null,"  "))
        this.line_parse_failed(false)
        this.line_warnings(result.line_warnings)
        this.line_has_warnings(result.line_warnings.length > 0)
        # this.line_has_warnings(result.warnings? and result.warnings.length > 0)

        dom_fixes()
      catch err
        console.log "line.parse - ERROR is #{err}"
        result="failed. (#{err})"
        this.line_parsed_doremi_script(null)
        this.line_warnings([])
        this.line_parse_failed(true)
        this.parse_tree_text("Parsing failed")
        this.rendered_in_html("<pre>Didn't parse\n\n#{this.source}</pre>")
      finally
        this.last_value_rendered=this.source
  

  Logger=_console.constructor
  # _console.level  = Logger.DEBUG
  _console.level  = Logger.WARN
  _.mixin(_console.toObject())
  
  unused_initialData = """
  Title: sample_composition
  
     .
  |: S - - -  :|
  
  || R - - - ||
     hi
  
  """
  initialData = ""
 
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
    self.selected_composition = ko.observable() # nothing selected by default
    self.composition_parse_tree_text=ko.observable("")
    self.doremi_script_source= ko.observable(my_doremi_script_source)
    self.open_file_visible=ko.observable(false)
    self.composition_info_visible=ko.observable(true)
    self.composition_parse_failed=ko.observable(false)
    self.calculate_stave_width=() ->
      width=$('div.composition_body').width()
      "#{width-50}px"
    self.calculate_textarea_width=() ->
      width=$('div.composition_body').width()
      "#{(width-50)/2}px"

    self.composition_stave_width= ko.observable(self.calculate_stave_width())
    self.composition_textarea_width= ko.observable(self.calculate_textarea_width())

    self.composition_lilypond_source_visible=ko.observable(false)
    self.composition_musicxml_source_visible=ko.observable(false)
    self.parsed_doremi_script_visible=ko.observable(false)
    self.composition_lilypond_output_visible=ko.observable(false)
    self.composition_lilypond_output=ko.observable(false)
    self.doremi_script_source_visible=ko.observable(false)
    self.composition_handle_resize= (my_model) ->
      console.log "handle_resize"

    self.toggle_composition_select_visible= (event) ->
      self.composition_select_visible(!this.composition_select_visible())
      self.refresh_compositions_in_local_storage()

    self.toggle_open_file_visible = () ->
      self.open_file_visible(!self.open_file_visible())
    self.toggle_parsed_doremi_script_visible = () ->
      self.parsed_doremi_script_visible(!self.parsed_doremi_script_visible())
    self.toggle_staff_notation_visible = () ->
      self.staff_notation_visible(!self.staff_notation_visible())

    self.toggle_composition_musicxml_source_visible = () ->
      self.composition_musicxml_source_visible(!self.composition_musicxml_source_visible())

    self.toggle_composition_lilypond_source_visible = () ->
      self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible())
    self.composition_as_html = ko.observable("")
       
    self.parse_composition = () ->
      self.refresh_doremi_script_source()
      console.log("parse_composition")
      try
        parsed=DoremiScriptParser.parse(self.doremi_script_source())
        #console.log("parse_composition, parse =",parsed)
        self.composition_parsed_doremi_script(parsed)
        self.composition_parse_tree_text("Parsing completed with no errors \n"+JSON.stringify(result,null,"  "))
        self.composition_parse_failed(false) 
        x=to_html(parsed)
        console.log "parse_composition, x=",x
        my_html=to_html(parsed)
        self.composition_as_html(my_html)
      catch err
        result="failed. (#{err})"
        console.log("parse_composition, ERROR=",err)
        self.composition_parsed_doremi_script(null)
        self.composition_parse_failed(true)
        self.composition_parse_tree_text("Parsing failed")
      finally

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
    self.composition_musicxml_source=ko.observable("")
    self.composition_lilypond_source=ko.observable("")
    self.composition_parsed_doremi_script=ko.observable()
    self.composition_parse_warnings = ko.computed () ->
      parse_tree= self.composition_parsed_doremi_script()
      return false if !parse_tree?
      return false if !parse_tree.warnings?
      parse_tree.warnings.length > 0
    self.staff_notation_url=ko.observable(NONE_URL)
    
    self.keys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"]
    self.key= ko.observable("")
    self.staff_notation_url_with_time_stamp = ko.computed () ->
      if self.staff_notation_url() is NONE_URL
        return self.staff_notation_url()
      time_stamp=new Date().getTime()
      "#{self.staff_notation_url()}?ts=#{time_stamp}"
    self.modes=["Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"]
    self.mode= ko.observable("")
    self.lines = ko.observableArray([])

    self.generate_staff_notation = (my_model) ->
      # generate staff notation by converting doremi_script
      # to lilypond and call a web service
      console.log "entering generate_staff_notation"
      self.generating_staff_notation(true)
      self.refresh_doremi_script_source()
      self.parse_composition()
      self.refresh_composition_lilypond_source()
      self.staff_notation_url(NONE_URL)
      lilypond_source=self.composition_lilypond_source()
      console.log "lilypond_source",lilypond_source
      ts= new Date().getTime()
      url='/lilypond_server/lilypond_to_jpg'
      timeout_in_seconds=60
      my_data =
        fname: "#{self.title()}_#{self.author()}_#{self.id()}"
        lilypond: lilypond_source
        doremi_script_source: self.doremi_script_source() 
      obj=
        dataType : "json",
        timeout : timeout_in_seconds * 1000  # milliseconds
        type:'POST'
        url: url
        data: my_data
        error: (some_data) ->
          self.generating_staff_notation(false)
          self.staff_notation_url(NONE_URL)
          alert("Couldn't connect to staff notation generator server at #{url}")
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
      $.ajax(obj)
      return true

    self.parse = (doremi_script_source_param) ->
      ret_val=null
      try
        ret_val=DoremiScriptParser.parse(doremi_script_source_param)
      catch err
        console.log "composition.parse- error is #{err}"
        ret_val=null
      finally
      ret_val

    self.attribute_keys=
      [
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
        "staff_notation_url"
      ]
    self.my_init = (doremi_script_source_param) ->
      console.log("Entering CompositionViewModel.init, source is",doremi_script_source_param)
      parsed=self.parse(doremi_script_source_param)
      console.log "parsed",parsed
      if !parsed
        alert("Something bad happened, parse failed")
        return
      self.composition_parsed_doremi_script(parsed)
      if !parsed.id?
        parsed.id=new Date().getTime()
      self[key](parsed[key]) for key in self.attribute_keys
      self.lines(ko.utils.arrayMap(parsed.lines, LineViewModel))

    self.add_line = () ->
      self.lines.push(x=new LineViewModel())
      x.parse()
      #ko.applyBindings(x)

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

    self.composition_select_visible= ko.observable(false)

    self.composition_select= (my_model,event) ->
      console.log "composition_select"
      # User clicked on the locally saved compositions select list
      # Load from local storage
      #
      # Loads the composition selected from the local storage select list
      return if !this.selected_composition()
      key=this.selected_composition().key
      
      self.composition_info_visible(true)
      self.loading_localy=true
      try
        self.load_locally(key)
      finally
        self.loading_locally=false
    self.refresh_composition_musicxml_source = (my_model) ->
      self.composition_musicxml_source(self.get_musicxml_source())
    self.refresh_doremi_script_source = (my_model) ->
      self.doremi_script_source(self.get_doremi_script_source())
    self.refresh_parsed_doremi_script = (my_model) ->
      self.parse_composition()
    self.refresh_composition_lilypond_source = (my_model) ->
      console.log("refresh_composition_lilypond_source")
      parsed=self.composition_parsed_doremi_script()
      options= { omit_header: true }
      self.composition_lilypond_source(window.to_lilypond(parsed,options))

    self.saveable = ko.computed () ->
      self.lines().length > 0 and self.title isnt ""
    self.print_composition = () ->
      line.editing(false) for line in self.lines()
      window.print()
    self.new_composition = () ->
      if self.saveable()
        if confirm("Save current composition in localStorage?")
          self.save_locally()
      initialData = ""
      window.the_composition.my_init(initialData)
      message_box("An untitled composition was created with a new id. Please enter a title")
      self.composition_info_visible(true)
      $('#composition_title').focus()

    self.refresh_compositions_in_local_storage  = () ->
      console.log "refresh_compositions_in_local_storage"
      Item = (key, doremi_script) ->
        # For list of compositions in local storage, grab the key and title
        @key = key
        # Grab the Title from the doremi script source
        ary= /Title: ([^\n]+)\n/.exec(doremi_script)
        @title= if !ary? then "untitled" else ary[1]
        this
      items=[]
      ctr=0
      if localStorage.length > 0
        while ctr < localStorage.length
          key=localStorage.key(ctr)
          if key.indexOf("composition_") is 0  # key starts with composition_
             items.push new Item(key,localStorage[key])
          ctr++
      items
      self.compositions_in_local_storage(items)

    self.compositions_in_local_storage = ko.observable([])
      
    self.load_locally = (key) ->
      return if self.loading_locally # avoid calling more than once
      console.log "load_locally"
      if key is "composition_#{window.the_composition.id()}"
        self.composition_select_visible(false)
        message_box("This is the file you are currently editing")
        return
      if self.saveable() # TODO:dry
        if confirm("Save current composition in localStorage before continuing?")
          self.save_locally()
      source=localStorage[key]
      window.the_composition.my_init(source)
      self.composition_select_visible(false)
      message_box("#{self.title()} was loaded from your browser's localStorage")
    self.get_musicxml_source = () ->
      window.to_musicxml(self.composition_parsed_doremi_script())
    self.get_doremi_script_source = () ->
      keys_to_use=self.attribute_keys
      json_str=JSON.stringify(ko.toJS(self), null, 2)
      json_object = $.parseJSON(json_str)
      # attributes don't have a blank line between them
      atts= for att,value of json_object
        continue if att not in keys_to_use
        att="Filename" if att is "filename"
        att="Title" if att is "title"
        att="Raga" if att is "raga"
        att="Key" if att is "key"
        att="Mode" if att is "mode"
        att="Author" if att is "author"
        att="Source" if att is "source"
        att="TimeSignature" if att is "time_signature"
        continue if value is ""
        continue if !value
        "#{att}: #{value}"
      atts_str=atts.join("\n")
      lines=(line.source for line in self.lines())
      # lines have a blank line between them
      lines_str=lines.join("\n\n")
      atts_str+"\n\n"+lines_str

    self.disable_generate_staff_notation= ko.computed () ->
      return true if self.title() is ""
      return true if self.lines().size is 0
      false

    self.save_locally = () ->
      console.log "save_locally"
      self.doremi_script_source(self.get_doremi_script_source())
      console.log('self.doremi_script_source()',self.doremi_script_source())
      localStorage.setItem("composition_#{self.id()}",self.doremi_script_source())
      message_box("#{self.title()} was saved in your browser's localStorage")
      # NOT WORKING
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
      which_line=line if line.last_value_rendered isnt line.source
      break if which_line
    if which_line?
      which_line.parse()
    t=setTimeout("timed_count()",1000)
  
  $(window).resize(() ->
    window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width())
  )
  
  window.timed_count()
  $('#composition_title').focus()
