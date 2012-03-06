NONE_URL="images/none.png"
unique_id=1000
# NOTE: space after barline is significant, parser fails without it
EMPTY_LINE_SOURCE ="| "
window.CompositionViewModel = (my_doremi_source) ->
  app=window.doremi_script_gui_app
  self = this
  self.last_line_opened=null
  self.help_visible=ko.observable(false)

  self.disable_context_menu=ko.observable(false) # for debugging only

  self.toggle_disable_context_menu= (event) ->
    self.disable_context_menu(!this.disable_context_menu())
    self.my_init(self.doremi_source())


  self.toggle_help_visible= (event) ->
    console.log "toggle_help_visible" if debug
    self.help_visible(!this.help_visible())
    if  self.help_visible()
      $('#help_content').html($('#help-tpl').html())
    else
      $('#help_content').html('')
  self.help_visible_action = ko.computed( help_visible_fun= () ->
    console.log "help_visible_action" if debug
    return if self.document?
    if self.help_visible()
      $("#help_button").text("Hide Help")
    else
      $("#help_button").text("Help")
    )


  self.editing_a_line= ko.observable(false)
  self.not_editing_a_line= ko.observable(true)
  self.editing_composition=ko.observable(false)
  self.last_doremi_source = ""
  self.lines = ko.observableArray([])
  self.selected_composition = ko.observable() # nothing selected by default
  self.staff_notation_url=ko.observable(NONE_URL)
  self.apply_hyphenated_lyrics=ko.observable(false)
  self.apply_hyphenated_lyrics.subscribe((newValue)->
    #set_timeout("composition.self.redraw()
    setTimeout("window.the_composition.redraw()",1000)
  )
  self.toggle_apply_hyphenated_lyrics=  (x) ->
    self.apply_hyphenated_lyrics(!self.apply_hyphenated_lyrics())

  self.composition_parse_tree_text=ko.observable("")
  self.open_file_visible=ko.observable(false)
  self.composition_info_visible=ko.observable(true)
  self.show_title=ko.observable(false)
  self.composition_parse_failed=ko.observable(false)
  self.calculate_stave_width=() ->
    width=$('div.composition_body').width()
    "#{width-150}px"
  self.calculate_textarea_width=() ->
    width=$('div.composition_body').width()
    "#{(width-150)}px"

  self.composition_stave_width= ko.observable(self.calculate_stave_width())
  self.composition_textarea_width= ko.observable(self.calculate_textarea_width())
  self.base_url=ko.observable(null)
  self.links_enabled=ko.computed( links_enabled= () ->
    console.log "links_enabled" if debug
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
    x="#{self.staff_notation_url()}?ts=#{time_stamp}"
    #TODO: clumsy
    self.staff_notation_url_with_time_stamp(x)
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
        console.log base_url if debug
        self.base_url(base_url)
        self.staff_notation_url(full_url_helper(some_data.fname))
        self.staff_notation_visible(true)
        self.composition_lilypond_output_visible(false)
    $.ajax(obj)

  self.generate_all_but_staff_notation = (my_model) ->
    self.generate_staff_notation_aux(my_model,"true")

  self.generate_staff_notation = (my_model) ->
    self.generate_staff_notation_aux(my_model)

  self.generate_staff_notation_aux = (my_model,dont="false") ->
    console.log "generate_staff_notation"
    self.compute_doremi_source()
    # generate staff notation by converting doremi_script
    # to lilypond and call a web service
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
      html_doc: self.generate_html_page_aux()
      doremi_source: src
      musicxml_source: self.get_musicxml_source()
      dont_generate_staff_notation:dont
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
          alert("An error occurred: #{some_data.lilypond_output}")
          return
        fname=some_data.fname
        base_url=fname.slice(0,fname.lastIndexOf('.'))
        console.log base_url if debug
        self.base_url(base_url)
        self.staff_notation_url(full_url_helper(some_data.fname))
        self.calculate_staff_notation_url_with_time_stamp()
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
    # TODO: use computed???
    # Turn the data on the web page into a doremi_script format
    #
    console.log "compute_doremi_source" if debug
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
      if att is "apply_hyphenated_lyrics"
        console.log("486--")
        att="ApplyHyphenatedLyrics"
      #att="ApplyHyphenatedLyrics" if att is "apply_hyphenated_lyrics"
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
      console.log "composition.parse- error is #{err}" if debug
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
    $('img.staff_notation').attr('src',NONE_URL)
    # Initialize composition with doremi_script_source
    self.staff_notation_url(NONE_URL) # TODO: use computed observables
    self.calculate_staff_notation_url_with_time_stamp()
    console.log("composition.my_init",doremi_source_param) if debug
    parsed=DoremiScriptParser.parse(doremi_source_param)
    self.composition_parsed_doremi_script(parsed)
    self.last_doremi_source=""
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
    console.log("Loading lines") if debug
    my_lines= (new LineViewModel(parsed_line) for  parsed_line in parsed.lines)
    self.lines(my_lines)
    self.calculate_staff_notation_url_with_time_stamp()
    self.redraw()
    seconds= 0.5
    setTimeout("dom_fixes()",0.5*1000)  # necessary?

  self.delete_line = (which_line) ->
    which_line.source("")
    self.redraw()
  self.add_line = () ->
    console.log "add_line" if debug
    self.lines.push(x=new LineViewModel(source: EMPTY_LINE_SOURCE))
    console.log('add line x is',x) if debug
    self.re_index_lines()
    self.redraw()
    console.log "add_line before x.edit()" if debug
    x.edit()
    return true

  self.edit_line_open=ko.observable(false)

  self.no_edit_line_open= ko.computed () ->
    !self.edit_line_open()

  self.composition_insert_line= (line_model, event) ->
    # insert line before the given line
    console.log "composition_insert_line" if debug
    index=line_model.index()
    console.log "insert_line, line_model,index",line_model,index if debug
    number_of_elements_to_remove=0
    self.lines.splice(index,number_of_elements_to_remove,x=new LineViewModel(source: EMPTY_LINE_SOURCE))
    self.re_index_lines()
    x.edit()
    return true

  self.re_index_lines=() ->
    # Note that the parser indexes the lines, but the indexes get
    # off as the composition is editted
    ctr=0
    console.log "re_index_lines" if debug
    for line in self.lines()
      line.index(ctr)
      ctr=ctr+1

  self.composition_append_line= (line_model, event) ->
    # append line after the given line
    console.log "composition_append_line" if debug
    index=line_model.index()
    number_of_elements_to_remove=0
    self.lines.splice(index+1,number_of_elements_to_remove,x=new LineViewModel({source: EMPTY_LINE_SOURCE}))
    self.re_index_lines()
    x.edit()
    return true

  self.composition_select_visible= ko.observable(false)

  self.saveable = ko.computed () ->
    console.log "in saveable" if debug
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

  self.close = () ->
    self.editing_composition(false)
    console.log "in close" if debug
    self.last_doremi_source=""
    self.lines.remove( ()-> true)
    console.log "after close, lines are",self.lines() if debug
  self.gui_close = () ->
    if self.ask_user_if_they_want_to_save()
      return
    self.close()

  self.print_composition = () ->
    line.editing(false) for line in self.lines()
    window.print()
  self.new_composition = () ->
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
        console.log "key is",key if debug
        if key.indexOf("composition_") is 0  # key starts with composition_
           items.push new Item(key,localStorage[key])
        ctr++
    items
    self.compositions_in_local_storage(items)

  self.compositions_in_local_storage = ko.observable([])
    
  self.get_musicxml_source = () ->
    window.to_musicxml(self.composition_parsed_doremi_script())

  self.disable_generate_staff_notation= ko.computed () ->
    console.log 'a'
    return true if self.editing_a_line()
    console.log 'a'
    return true if self.composition_parse_failed()
    console.log 'a'
    return true if self.title() is ""
    console.log 'a'
    return true if self.lines().length is 0
    console.log 'a'
    false

  self.generate_html_page_aux = () ->
    #window.generate_html_doc_ctr=3
    console.log "generate_html_page_aux"
    #return if window.generate_html_doc_ctr > 0
    a=$('#application_for_html_doc').html()
    b=$('#styles_for_html_doc').html()
    c=$('#doremi_for_html_doc').html()
    css=a+b+c
    js=$('#zepto_for_html_doc').html()
    js2=$('#dom_fixer_for_html_doc').html()
    all_js=js+js2
    composition=window.the_composition
    full_url=document.location.origin #"http://ragapedia.com"
    to_html_doc(self.composition_parsed_doremi_script(),full_url,css,all_js)

  self.get_dom_fixer = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/js/doremi-script-base/dom_fixer.js'
      dataType:'text'
      success: (data) ->
        $('#dom_fixer_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
  
  self.get_zepto = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/js/doremi-script-base/third_party/zepto.unminified.js'
      dataType:'text'
      success: (data) ->
        $('#zepto_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
   
  self.get_styles_css = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/css/styles.css'
      dataType:'text'
      success: (data) ->
        $('#styles_for_html_doc').html(data)
    $.ajax(params)
  self.get_doremi_css = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/css/doremi.css'
      dataType:'text'
      success: (data) ->
        $('#doremi_for_html_doc').html(data)
    $.ajax(params)

  self.get_application_css = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/css/application.css'
      dataType:'text'
      success: (data) ->
        $('#application_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)

  self.redraw= () =>

    try
      debug=false
      doremi_source=self.compute_doremi_source()
      count_before=self.lines().length
      console.log "redraw after compute_do_remi_source" if debug
      
      composition_view=self
      self.edit_line_open(false)
      composition_view.last_doremi_source = composition_view.doremi_source()
      parsed=composition_view.composition_parse()
      if parsed? and parsed.lines.length isnt count_before
        console.log("# of items changed!!") if debug
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
            if /^\s*$/.test(source) or source is ""
              view_line.rendered_in_html('(empty line)')
              continue
            parsed_line=DoremiScriptLineParser.parse(source)
            html=line_to_html(parsed_line)
            view_line.rendered_in_html(html)
            view_line.line_parse_failed(false)
          catch err # line didn't parse
            view_line.line_parse_failed(true)
            view_line.line_has_warnings(false)
            view_line.line_warnings([])
            view_line.rendered_in_html("<pre>Didn't parse\n#{view_line.source()}</pre>")
            console.log(view_line.rendered_in_html())
      else # parse (on whole input) succeeded.
        composition_view.composition_parse_failed(false)
        composition_view.composition_parsed_doremi_script(parsed)
        if composition_view.composition_musicxml_source_visible()
          composition_view.composition_musicxml_source(to_musicxml(parsed))
        parsed_lines=parsed.lines
        view_lines=composition_view.lines()
        ctr=0
        if parsed_lines.length isnt view_lines.length
          console.log "Info:assertion failed parsed_lines.length isnt view_lines.length"
          self.my_init(doremi_source)
          return # runs finally section below
        for parsed_line in parsed_lines
          view_line=view_lines[ctr]
          if /^\s*$/.test(view_line.source())
            view_line.rendered_in_html('(empty line)')
            continue
          # Update the view
          # TODO: should I be calling init on the line?
          # TODO: add parsed_line as an attribute of LineView ?
          # Note that the parsed_line has all the information
          # needed to render it.

          # render line as html-see html_renderer.coffee
          html=line_to_html(parsed_line)
          view_line.line_parse_failed(false)
          view_line.rendered_in_html(html)
          warnings=parsed_line.line_warnings
          view_line.line_warnings(warnings)
          view_line.line_has_warnings(warnings.length > 0)
          ctr++
     catch err
       console.log "Error in redraw #{err}" #if debug
    finally
      app.setup_context_menu()
      dom_fixes()
  self.save_locally = () ->
    if self.composition_parse_failed() is true
      alert("Can't save because there are syntax errors. Please fix the lines outlined in red first")
      return true
    localStorage.setItem("composition_#{self.id()}",self.doremi_source())
    message_box("#{self.title()} was saved in your browser's localStorage")
  self.my_init(my_doremi_source) if my_doremi_source?
  self
