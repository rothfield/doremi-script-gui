$(document).ready ->
  window.doremi_script_gui_app={}
  app=window.doremi_script_gui_app

  app.sanitize= (name)->
     name.replace(/[^0-9A-Za-z.\-]/g, '_').toLowerCase()

  setup_downloadify = () ->
    console.log "entering setup_downloadify"
    app.params_for_download_lilypond =
    	filename: () ->
        "#{app.the_composition.filename()}.ly"
      data: () ->
        app.the_composition.composition_lilypond_source()
  	  onComplete: () ->
        console.log 'Your File Has Been Saved!' if debug

      swf: './js/doremi-script/third_party/downloadify/downloadify.swf'
      downloadImage: './images/save.png'
      height:19
      width:76
      transparent:true
      append:false
      onComplete: () ->
        alert("Your file was saved")
    app.params_for_download_sargam= _.clone(app.params_for_download_lilypond)
    app.params_for_download_sargam.data = () ->
        app.the_composition.doremi_source()
    app.params_for_download_sargam.filename = () ->
      "#{app.sanitize(app.the_composition.title())}.doremi_script.txt"
    $("#download_lilypond").downloadify(app.params_for_download_lilypond)
    $("#save").downloadify(app.params_for_download_sargam)
    #   $("#download_musicxml_source").downloadify(params_for_download_musicxml)
  
  initialData = "Title: testing\nAuthor: anon\nApplyHyphenatedLyrics: true\nmany words aren't hyphenated\n\n| SRG- m-m-\n. \n\n|PDNS"
  initialData = ""
  debug=false
  NONE_URL="images/none.png"
  unique_id=1000
  # NOTE: space after barline is significant, parser fails without it
  EMPTY_LINE_SOURCE =""
  message_box= (str) ->
    alert(str)

  full_url_helper = (fname) ->
    loc=document.location
    "#{loc.protocol}//#{loc.host}#{fname}"

  window.LineViewModel = (line_param= {source: EMPTY_LINE_SOURCE,rendered_in_html:"(Empty Line)"}) ->  # parameter is PARSED line
    line_id: ko.observable(unique_id++)
    
    console.log "LineViewModel" if debug
    ### TODO: make computed with throttle? ###
    line_parsed_doremi_script: ko.observable(null)
    line_parse_failed: ko.observable(false)
    line_warnings: ko.observable([])
    line_has_warnings: ko.observable(false)
    line_warnings_visible: ko.observable(false)
    parse_tree_visible: ko.observable(false)
    parse_tree_text: ko.observable("parse tree text here")
    editing: ko.observable(false)
    not_editing: ko.observable(true)
    last_html_rendered: ""
    stave_height: ko.observable("161px")
    index: ko.observable(line_param.index) # 0 and up
    source: ko.observable(line_param.source) # doremi_source for this line
    rendered_in_html: ko.observable(line_param.rendered_in_html)

    # Behaviours
    line_wrapper_click: (my_model,event) ->
      console.log "line_wrapper_click",event if debug
      if !this.editing()
        this.editing(true)
        this.not_editing(false)
        current_target=event.currentTarget
        text_area=$(current_target).parent().find("textarea")
        $(text_area).focus()
      return true
    insert_line: (my_model, event) ->
      console.log "insert_line" if debug
      return true
    close_edit: (my_model, event) ->
      return true if !this.editing()
      console.log "close_edit" if debug
      this.editing(false)
      this.not_editing(true)
      return true
    
    toggle_line_warnings_visible: (event) ->
      this.line_warnings_visible(!this.line_warnings_visible())
    toggle_parse_tree_visible: (event) ->
      this.parse_tree_visible(!this.parse_tree_visible())
      return true
    
    edit: (my_model,event) ->
      # Handles click on rendered html in gui
      if (this.editing())
        return false
      for line in window.the_composition.lines()
        line.editing(false)
      this.editing(true)
      this.not_editing(false)
      dom_id=this.entry_area_id()
      $("textarea#"+dom_id).focus()
      true
    #line_wrapper_id: () ->
    #  return if this.document
    #  "line_wrapper_#{this.line_id()}"
    
    entry_area_id: ko.observable("entry_area_#{unique_id}")
    handle_key_press: (current_line,event) ->
      let_default_action_proceed=true
      let_default_action_proceed
  

  Logger=_console.constructor
  # _console.level  = Logger.DEBUG
  _console.level  = Logger.WARN
  _.mixin(_console.toObject())
  
 
  handleFileSelect = (evt) =>
    console.log "handle_file_select"
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
      console.log "onload"
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

  window.CompositionViewModel = (my_doremi_source) ->
    self = this
    self.help_visible=ko.observable(false)
    self.toggle_help_visible= (event) ->
      self.help_visible(!this.help_visible())
    self.help_visible_action = ko.computed( help_visible_fun= () ->
      console.log "help_visible_action"
      return if self.document?
      if self.help_visible()
        $("#help_button").text("Hide Help")
      else
        $("#help_button").text("Help")
      )
    self.editing_composition=ko.observable(false)
    self.last_doremi_source = ""
    self.lines = ko.observableArray([])
    self.selected_composition = ko.observable() # nothing selected by default
    self.staff_notation_url=ko.observable(NONE_URL)
    self.apply_hyphenated_lyrics=ko.observable(false)
    self.composition_parse_tree_text=ko.observable("")
    self.open_file_visible=ko.observable(false)
    self.composition_info_visible=ko.observable(true)
    self.show_title=ko.observable(true)
    
    self.composition_parse_failed=ko.observable(false)
    self.calculate_stave_width=() ->
      width=$('div.composition_body').width()
      "#{width-50}px"
    self.calculate_textarea_width=() ->
      width=$('div.composition_body').width()
      "#{(width-50)/2}px"

    self.composition_stave_width= ko.observable(self.calculate_stave_width())
    self.composition_textarea_width= ko.observable(self.calculate_textarea_width())
    self.base_url=ko.observable(null)
    self.links_enabled=ko.computed( links_enabled= () ->
      console.log "links_enabled"
      url=self.base_url()
      url? and url isnt ""
    )


    self.lilypond_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.ly"
    )
    self.music_xml_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.xml"
    )
    self.html_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.html"
    )
    self.jpg_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.jpg"
    )
    self.pdf_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.pdf"
    )
    self.midi_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.mid"
    )
    self.doremi_source_url=ko.computed(()->
      base_url=self.base_url()
      return "/#" if  !base_url
      "#{base_url}.doremi_script.txt"
    )

    self.composition_lilypond_source_visible=ko.observable(false)
    self.composition_musicxml_source_visible=ko.observable(false)
    self.parsed_doremi_script_visible=ko.observable(false)
    self.composition_lilypond_output_visible=ko.observable(false)
    self.composition_lilypond_output=ko.observable(false)
    self.doremi_source_visible=ko.observable(false)

    self.toggle_title_visible= (event) ->
      self.show_title(!this.show_title())
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
      #console.log "toggle"
      self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible())
      return
      if self.composition_lilypond_source_visible
        parsed=self.composition_parsed_doremi_script()
        if parsed?
          self.composition_lilypond_source(to_lilypond(parsed))
        else
          self.composition_lilypond_source("")


    self.composition_as_html = ko.observable("")
       
    self.toggle_doremi_source_visible = () ->
      self.doremi_source_visible(!self.doremi_source_visible())

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
    self.staff_notation_url=ko.observable(NONE_URL)
    
    self.keys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"]
    self.key= ko.observable("")

    self.staff_notation_url_with_time_stamp = ko.observable()

    self.calculate_staff_notation_url_with_time_stamp = () ->
      if self.staff_notation_url() is NONE_URL
        return self.staff_notation_url()
      time_stamp=new Date().getTime()
      "#{self.staff_notation_url()}?ts=#{time_stamp}"
    self.modes=["ionian","dorian","phrygian","lydian","mixolydian","aeolian","locrian"]

    self.mode= ko.observable("")


    self.download_doremi_source_file = (my_model) ->
      # First save file to server
      url='/doremi_script_server/save_to_server'
      lilypond_source=self.composition_lilypond_source()
      timeout_in_seconds=60
      src=self.doremi_source()
      my_data =
        lilypond:self.composition_lilypond_source()
        fname: "#{self.title()}_#{self.author()}_#{self.id()}"
        doremi_source: src
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
          if some_data.error
            alert("An error occurred: #{some_data.error}")
            return
          fname=some_data.fname
          base_url=fname.slice(0,fname.lastIndexOf('.'))
          console.log base_url
          self.base_url(base_url)
          self.staff_notation_url(full_url_helper(some_data.fname))
          self.staff_notation_visible(true)
          self.composition_lilypond_output_visible(false)
      $.ajax(obj)

    self.generate_staff_notation = (my_model) ->
      # generate staff notation by converting doremi_script
      # to lilypond and call a web service
      #console.log "entering generate_staff_notation"
      self.generating_staff_notation(true)
      lilypond_source=self.composition_lilypond_source()
      #console.log "lilypond_source",lilypond_source
      ts= new Date().getTime()
      url='/lilypond_server/lilypond_to_jpg'
      timeout_in_seconds=60
      src=self.doremi_source()
      my_data =
        fname: app.sanitize(self.title())
        #"#{self.title()}_#{self.author()}_#{self.id()}"
        lilypond: lilypond_source
        doremi_source: src
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
            alert("An error occurred: #{some_data.error}")
            return
          fname=some_data.fname
          base_url=fname.slice(0,fname.lastIndexOf('.'))
          console.log base_url
          self.base_url(base_url)
          self.staff_notation_url(full_url_helper(some_data.fname))
          x= self.calculate_staff_notation_url_with_time_stamp()
          self.staff_notation_url_with_time_stamp(x)
          self.staff_notation_visible(true)
          self.composition_lilypond_output_visible(false)
      $.ajax(obj)
      return true




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
        "apply_hyphenated_lyrics"
      ]

    self.compute_doremi_source = () ->
      # Turn the data on the web page into a doremi_script format
      #
      console.log "compute_doremi_source"
      # list dependencies
      self.id()
      self.title()
      self.filename()
      self.raga()
      self.key()
      self.mode()
      self.author()
      self.source()
      self.time_signature()
      self.apply_hyphenated_lyrics()
      self.staff_notation_url()
      self.lines()
      keys_to_use=self.attribute_keys
      keys=["id","title","filename","raga","key",
            "mode","author",
            "source","time_signature","apply_hyphenated_lyrics",
            "staff_notation_url"]
      atts= for att in keys
        value=self[att]()
        att="Filename" if att is "filename"
        att="Title" if att is "title"
        att="Raga" if att is "raga"
        att="Key" if att is "key"
        att="Mode" if att is "mode"
        att="Author" if att is "author"
        att="Source" if att is "source"
        att="TimeSignature" if att is "time_signature"
        att="ApplyHyphenatedLyrics" if att is "apply_hyphenated_lyrics"
        att="StaffNotationURL" if att is "staff_notation_url"
        continue if value is ""
        continue if !value
        "#{att}: #{value}"
      atts_str=atts.join("\n")
      lines=(line.source() for line in self.lines())
      # lines have a blank line between them
      lines_str=lines.join("\n\n")
      atts_str+"\n\n"+ lines_str

    self.doremi_source= ko.computed(self.compute_doremi_source)
    self.composition_parse = () ->
      #console.log "entering composition_parse"
      ret_val=null
      try
        source=self.doremi_source()
        ret_val=DoremiScriptParser.parse(source)
      catch err
        console.log "composition.parse- error is #{err}"
        ret_val=null
      finally
      ret_val

    self.composition_parsed_doremi_script=ko.observable(null)

    self.composition_musicxml_source=ko.computed(() ->
      #console.log "in composition_musicxml_source"
      parsed=self.composition_parsed_doremi_script()
      return "" if !parsed?
      to_musicxml(parsed)
    
    )
    self.composition_lilypond_source=ko.computed(() ->
      #console.log "in composition_lilypond_source"
      parsed=self.composition_parsed_doremi_script()
      return "" if !parsed?
      to_lilypond(parsed)
    )

    self.composition_parse_warnings = ko.computed () ->
      parse_tree= self.composition_parsed_doremi_script()
      return false if !parse_tree?
      return false if !parse_tree.warnings?
      parse_tree.warnings.length > 0

    self.my_init = (doremi_source_param) ->
      # Initialize composition with doremi_script_source
      console.log("composition.my_init",doremi_source_param)
      parsed=DoremiScriptParser.parse(doremi_source_param)
      self.composition_parsed_doremi_script(parsed)
      if !parsed
        alert("Something bad happened, parse failed")
        return
      if !parsed.id?
        parsed.id=new Date().getTime()
      for key in self.attribute_keys
        val=parsed[key]
        fct=self[key]
        fct(val)
        #self[key](parsed[key])
      console.log "check mode here"
      self.lines(ko.utils.arrayMap(parsed.lines, LineViewModel))

    self.add_line = () ->
      console.log "add_line"
      self.lines.push(x=new LineViewModel(source: EMPTY_LINE_SOURCE))
      x.edit()

    self.composition_insert_line= (line_model, event) ->
      #console.log "insert_line"
      index=line_model.index()
      number_of_elements_to_remove=0
      self.lines.splice(index,number_of_elements_to_remove,new LineViewModel(source: EMPTY_LINE_SOURCE))
      new_source=self.compute_doremi_source()
      self.my_init(new_source)
      return true

    self.composition_append_line= (line_model, event) ->
      console.log "append_line"
      index=line_model.index()
      number_of_elements_to_remove=0
      self.lines.splice(index+1,number_of_elements_to_remove,new LineViewModel({source: EMPTY_LINE_SOURCE}))
      new_source=self.compute_doremi_source()
      self.my_init(new_source)
      return true

    self.remove_line = (line) ->
      res=confirm("Are you sure?")
      return if !res
      self.lines.remove(line)

    self.composition_select_visible= ko.observable(false)

    self.load_locally = (key) ->
      debug=true
      console.log "entering load_locally, key is#{key}"
      # TODO: use try/finally
      console.log "load_locally" if debug
      if self.editing_composition()
        if key is "composition_#{window.the_composition.id()}"
          self.composition_select_visible(false)
          message_box("This is the file you are currently editing")
          return
      self.ask_user_if_they_want_to_save()
      source=localStorage[key]
      console.log "source is #{source}" if debug
      self.my_init(source)
      self.editing_composition(true)
      message_box("#{self.title()} was loaded from your browser's localStorage")
      self.help_visible(false)
      $('#composition_title').focus()

    self.composition_select= (my_model,event) ->
      return if self.loading_locally # avoid calling more than once
      self.composition_select_visible(false)
      # User clicked on the locally saved compositions select list
      # Load from local storage
      return if !this.selected_composition()
      key=this.selected_composition().key
      try
        self.loading_locally=true
        self.load_locally(key)
      catch err
        alert("An error occurred loading the file. Source was\n")
      finally
        self.loading_locally=false
        $('#composition_select')[0].selectedIndex=-1
      self.composition_info_visible(false)

    self.saveable = ko.computed () ->
      console.log "in saveable"
      self.title() isnt ""
      #(self.lines().length > 0) and self.title isnt ""
    self.ask_user_if_they_want_to_save = () ->
      # returning true means user wants to save
      if self.editing_composition()
        if self.saveable()
          if confirm("Save current composition before continuing?")
            alert("Click the Save button to save your composition")
            return true

    self.initial_help_display=ko.observable(false)

    self.destroy_locally = () ->
      x=prompt("Enter yes to remove this document from local storage. This operation cannot be undone.")
      return if !x?
      return if x isnt "yes"
      key= "composition_#{self.id()}"
      delete localStorage[key]
      self.close()
    self.close = () ->
      self.editing_composition(false)
      console.log "in close"
      self.last_doremi_source=""
      self.lines.remove( ()-> true)
      console.log "after close, lines are",self.lines()
    self.gui_close = () ->
      if self.ask_user_if_they_want_to_save()
        return
      self.close()
    self.print_composition = () ->
      line.editing(false) for line in self.lines()
      window.print()
    self.new_composition = () ->
      self.ask_user_if_they_want_to_save()
      if self.ask_user_if_they_want_to_save()
        return
      initialData = ""
      window.the_composition.my_init(initialData)
      message_box("An untitled composition was created with a new id. Please enter a title")
      self.composition_info_visible(true)
      self.editing_composition(true)
      self.help_visible(false)
      $('#composition_title').focus()

    self.refresh_compositions_in_local_storage  = () ->
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
          console.log "key is",key
          if key.indexOf("composition_") is 0  # key starts with composition_
             items.push new Item(key,localStorage[key])
          ctr++
      items
      self.compositions_in_local_storage(items)

    self.compositions_in_local_storage = ko.observable([])
      
    self.get_musicxml_source = () ->
      window.to_musicxml(self.composition_parsed_doremi_script())

    self.disable_generate_staff_notation= ko.computed () ->
      return true if self.composition_parse_failed()
      return true if self.title() is ""
      return true if self.lines().size is 0
      false

    self.save_locally = () ->
      if self.composition_parse_failed() is true
        alert("Can't save because there are syntax errors. Please fix the lines outlined in red first")
        return true
      localStorage.setItem("composition_#{self.id()}",self.doremi_source())
      message_box("#{self.title()} was saved in your browser's localStorage")
    self.my_init(my_doremi_source) if my_doremi_source?
    self

  window.the_composition=new CompositionViewModel() # TOODO: move away from window.the_composition
  app.the_composition=window.the_composition
  window.the_composition.help_visible(false)
  #window.the_composition.my_init(initialData)
  ko.applyBindings(window.the_composition,$('html')[0])
  
  window.timed_count = () =>
    debug=true
    # Timer that runs every second or so.
    # It refreshes the whole page
    # TODO: avoid refreshing parts that didn't change
    composition_view=window.the_composition
    for view_line in composition_view.lines() # hack
      if view_line.source() is ""
         view_line.rendered_in_html('(empty line)')
         view_line.line_parse_failed(false)
         view_line.line_has_warnings(false)
         view_line.line_warnings([])

    if composition_view.last_doremi_source isnt composition_view.doremi_source() # the source changed
      composition_view.last_doremi_source = composition_view.doremi_source()
      parsed=composition_view.composition_parse()
      if !parsed?  # Didn't parse
        console.log "Parse failed" if debug
        composition_view.composition_parse_failed(true)
        # sadly, run the line parser on each line in the view 
        # to find which line or lines
        # didn't parse.
        for view_line in composition_view.lines()
          console.log "composition parse failed, checking #{view_line.source()}"
          try
            source=view_line.source()
            ret_val=DoremiScriptLineParser.parse(source)
            view_line.rendered_in_html('')
            view_line.line_parse_failed(false)
          catch err # line didn't parse
            view_line.line_parse_failed(true)
            view_line.line_has_warnings(false)
            view_line.line_warnings([])
            view_line.rendered_in_html("<pre>Didn't parse\n#{view_line.source()}</pre>")
      else # parse succeeded.
        composition_view.composition_parse_failed(false)
        composition_view.composition_parsed_doremi_script(parsed)
        if composition_view.composition_musicxml_source_visible()
          composition_view.composition_musicxml_source(to_musicxml(parsed))
        parsed_lines=parsed.lines
        view_lines=composition_view.lines()
        ctr=0
        if parsed_lines.length isnt view_lines.length
          console.log "Info:assertion failed parsed_lines.length isnt view_lines.length"
        for parsed_line in parsed_lines
          # Update the view
          # TODO: should I be calling init on the line?
          # TODO: add parsed_line as an attribute of LineView ?
          # Note that the parsed_line has all the information
          # needed to render it.

          # render line as html-see html_renderer.coffee
          html=line_to_html(parsed_line)
          view_line=view_lines[ctr]
          view_line.line_parse_failed(false)
          view_line.rendered_in_html(html)
          warnings=parsed_line.line_warnings
          view_line.line_warnings(warnings)
          view_line.line_has_warnings(warnings.length > 0)
          ctr++
        dom_fixes()
    else
      # If we didn't run the renderer, run dom_fixes in case something
      # has changed
      dom_fixes()
    # At the end of the task, re-start the timer
    debug=false
    t=setTimeout("timed_count()",500)  # TODO: use try catch to make sure timer always gets re-run
  
  $(window).resize(() ->
    console.log("info:resize")
    window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width())
  )
  setup_downloadify()
  
  window.timed_count() # start the timer
  $('#composition_title').focus()

