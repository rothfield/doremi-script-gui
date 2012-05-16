NONE_URL="images/none.png"
# NOTE: space after barline is significant, parser fails without it

window.CompositionViewModel = (my_doremi_source) ->
  debug=false
  app=window.doremi_script_gui_app
  self = this
  self.help_visible=ko.observable(false)

  self.disable_context_menu=ko.observable(false) # for debugging only

  self.handle_link_click = (x,y) ->
    console.log "handle_link_click",x,y if debug
    target=y.target #TODO: crossbrowser here?
    if target.href.indexOf("#") isnt -1
      alert("Please click the Update all button first")
      return false
    true

  self.toggle_help_visible= (event) ->
    console.log "toggle_help_visible" if debug
    self.help_visible(!this.help_visible())
    if  self.help_visible()
      $('#help_content').html($('#help-tpl').html())
    else
      $('#help_content').html('')

  self.editing_a_line= ko.observable(false)
  self.not_editing_a_line= ko.observable(true)
  self.editing_composition=ko.observable(false)
  self.lines = ko.observableArray([])
  self.staff_notation_url=ko.observable(NONE_URL)
  self.apply_hyphenated_lyrics=ko.observable(false)
  self.toggle_apply_hyphenated_lyrics=  (x) ->
    self.apply_hyphenated_lyrics(!self.apply_hyphenated_lyrics())
    self.redraw()

  self.composition_parse_tree_text=ko.observable("")
  self.open_file_visible=ko.observable(false)
  self.composition_info_visible=ko.observable(true)
  self.show_title=ko.observable(false)


  self.show_hyphenated_lyrics=ko.observable(false)

  self.hide_show_hyphenated_lyrics=() ->
    if self.show_hyphenated_lyrics()
      $('.lyrics_section.hyphenated').show()
    else
      $('.lyrics_section.hyphenated').hide()

  self.hide_hyphenated_lyrics=ko.computed( () ->
    !self.show_hyphenated_lyrics()
    self.hide_show_hyphenated_lyrics()
  )
  self.hide_title=ko.computed( () ->
    !self.show_title()
  )
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
    base_url=base_url.replace('compositions','compositions2')
    "#{base_url}.doremi_script.txt"
  )

  
  self.composition_lilypond_source_visible=ko.observable(false)
  self.composition_musicxml_source_visible=ko.observable(false)
  self.parsed_doremi_script_visible=ko.observable(false)
  self.composition_lilypond_output_visible=ko.observable(false)
  self.composition_lilypond_output=ko.observable(false)
  self.doremi_source_visible=ko.observable(false)

  self.toggle_hyphenated_lyrics_visible= (event) ->
    self.show_hyphenated_lyrics(!this.show_hyphenated_lyrics())

  self.toggle_title_visible= (event) ->
    self.show_title(!this.show_title())

  self.toggle_open_file_visible = () ->
    self.open_file_visible(!self.open_file_visible())

  self.toggle_parsed_doremi_script_visible = () ->
    self.parsed_doremi_script_visible(!self.parsed_doremi_script_visible())
    self.redraw()

  self.toggle_staff_notation_visible = () ->
    self.staff_notation_visible(!self.staff_notation_visible())

  self.toggle_composition_musicxml_source_visible = () ->
    self.composition_musicxml_source_visible(!self.composition_musicxml_source_visible())

  self.toggle_composition_lilypond_source_visible = () ->
    self.composition_lilypond_source_visible(!self.composition_lilypond_source_visible())

  self.toggle_doremi_source_visible = () ->
    self.doremi_source_visible(!self.doremi_source_visible())
    self.composition_parse()
  self.toggle_composition_info_visible = () ->
    self.composition_info_visible(!self.composition_info_visible())
    
  self.id=ko.observable("")
  self.raga=ko.observable("")
  self.author=ko.observable("")
  self.staff_notation_visible=ko.observable(true)
  self.source=ko.observable("") # IE AAK
  self.filename=ko.observable("")
  self.time_signature=ko.observable("")
  self.title=ko.observable("")
  self.notes_used=ko.observable("SP")
  self.show_hyphenated_lyrics=ko.observable(false)
  self.force_notes_used=ko.observable(false)
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
  self.true_false_options=["false","true"]
  self.mode= ko.observable("")


  self.download_doremi_source_file = (my_model) ->
    self.doremi_source(self.compute_doremi_source())
    # First save file to server
    url='/doremi_script_server/save_to_server'
    timeout_in_seconds=60
    my_data =
      fname: "#{self.title()}_#{self.author()}_#{self.id()}"
      doremi_source: self.doremi_source()
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
        self.staff_notation_url(app.app.full_url_helper(some_data.fname))
        self.staff_notation_visible(true)
        self.composition_lilypond_output_visible(false)
    $.ajax(obj)

  self.generate_all_but_staff_notation = (my_model) ->
    self.generate_staff_notation_aux(my_model,"true")

  self.generate_staff_notation = (my_model) ->
    self.generate_staff_notation_aux(my_model)

  self.generate_staff_notation_aux = (my_model,dont="false") ->
    console.log "generate_staff_notation" if debug
    self.redraw()
    # generate staff notation by converting doremi_script
    # to lilypond and call a web service
    # TODO: 
    # ?? get rid of lilypond_source param and musicxml_source
    # I don't trust any lilypond...
    self.generating_staff_notation(true)
    ts= new Date().getTime()
    url='/lilypond_server/lilypond_to_jpg'
    timeout_in_seconds=60
    my_data =
      fname: app.sanitize(self.title())
      html_doc: self.generate_html_page_aux()
      doremi_source: self.doremi_source
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
        self.staff_notation_url(app.full_url_helper(some_data.fname))
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
      "force_notes_used"
      "show_hyphenated_lyrics"
      "title"
      "key"
      "mode"
      "staff_notation_url"
      "apply_hyphenated_lyrics"
    ]


  self.capitalize_first_letter = (string) ->
    string.charAt(0).toUpperCase() + string.slice(1)


  self.ruby_style_to_capitalized= (str) ->
    ary=str.split('_')
    ary2=(self.capitalize_first_letter item for item in ary)
    ary2.join ''
    

  self.compute_doremi_source = () ->
    # Turn the data on the web page into doremi_script format
    # Note that a doremi-script text file starts like this:
    # id: 1327249816068
    # Title: aardvark
    # Filename: untitled
    # Key: D
    # Mode: phrygian
    # Author: Traditional
    # Source: AAK
    # TimeSignature: 4/4
    # ApplyHyphenatedLyrics: true
    # StaffNotationURL: http://ragapedia.local/compositions/aardvark.jpg
    # 
    console.log "compute_doremi_source" if debug
    keys_to_use=self.attribute_keys
    # TODO: dry with other list of attributes
    keys=["id","title","filename","raga","key",
          "mode","author",
          "source","time_signature","apply_hyphenated_lyrics","show_hyphenated_lyrics",
          "staff_notation_url","notes_used","force_notes_used"]
    atts= for att in keys
      value=self[att]()
      capitalized_att=self.ruby_style_to_capitalized att
      console.log "capitalized_att", capitalized_att if debug
      if att is 'id'
        capitalized_att='id'
        continue
      continue if !value? or  value is ""
      "#{capitalized_att}: #{value}"
    atts_str=atts.join("\n")
    lines=(line.source() for line in self.lines())
    # lines have a blank line between them
    lines_str=lines.join("\n\n")
    atts_str+"\n\n"+ lines_str

  self.doremi_source= ko.observable(null)

  self.composition_parse = () ->
    self.doremi_source(self.compute_doremi_source())
    ret_val=null
    try
      source=self.doremi_source()
      ret_val=DoremiScriptParser.parse(source)
    catch err
      console.log "composition.parse- error is #{err}" if debug
      ret_val=null
    finally
    ret_val

 

  #composition_view.composition_parsed_doremi_script(parsed)

  self.composition_parsed_doremi_script=ko.observable(null)

  self.composition_musicxml_source=ko.computed(() ->
    console.log "in composition_musicxml_source" if debug
    parsed=self.composition_parsed_doremi_script()
    return "" if !parsed?
    to_musicxml(parsed)
  
  )
  self.composition_lilypond_source=ko.computed(() ->
    console.log "in composition_lilypond_source" if debug
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
    self.staff_notation_url(NONE_URL)
    self.calculate_staff_notation_url_with_time_stamp()
    #self.staff_notation_url(app.app.full_url_helper(some_data.fname))
    console.log("composition.my_init",doremi_source_param) if debug
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
    console.log("Loading lines") if debug
    my_lines= (new LineViewModel(parsed_line) for  parsed_line in parsed.lines)
    self.lines(my_lines)
    self.calculate_staff_notation_url_with_time_stamp()
    self.editing_a_line(false)
    self.editing_composition(true)
    self.not_editing_a_line(true)
    self.redraw()

  self.delete_line = (which_line) ->
    which_line.source("")
    self.redraw()
  self.add_line = () ->
    console.log "add_line" if debug
    self.lines.push(x=new LineViewModel())
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
    self.lines.splice(index,
                      number_of_elements_to_remove,x=new LineViewModel())
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
    self.lines.splice(index+1,number_of_elements_to_remove,x=new LineViewModel())
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
    self.lines.remove( ()-> true)
    console.log "after close, lines are",self.lines() if debug
  self.gui_close = () ->
    if self.ask_user_if_they_want_to_save()
      return
    self.close()
    window.location='#root'

  self.print_composition = () ->
    line.editing(false) for line in self.lines()
    window.print()
  self.new_composition = () ->
    console.log "cvm new_composition"
    if self.ask_user_if_they_want_to_save()
      return
    initialData = ""
    window.the_composition.my_init(initialData)
    self.add_line()
    #app.message_box("An untitled composition was created with a new id. Please enter a title")
    self.title("untitled")
    self.composition_info_visible(true)
    self.editing_composition(true)
    self.help_visible(false)
    #$('#composition_title').focus()

  self.get_musicxml_source = () ->
    window.to_musicxml(self.composition_parsed_doremi_script())

  self.disable_generate_staff_notation= ko.computed () ->
    return true if self.editing_a_line()
    return true if self.composition_parse_failed()
    return true if self.title() is ""
    return true if self.lines().length is 0
    false

  self.generate_html_page_aux = () ->
    #window.generate_html_doc_ctr=3
    console.log "generate_html_page_aux" if debug
    #return if window.generate_html_doc_ctr > 0
    a=$('#styles_for_html_doc').html()
    b=$('#doremi_for_html_doc').html()
    c=$('#application_for_html_doc').html()
    css=a+b+c
    console.log "in generate_html_page_aux, css is #{css}" if debug
    js=$('#zepto_for_html_doc').html()
    js2=$('#dom_fixer_for_html_doc').html()
    all_js=js+js2
    composition=window.the_composition
    full_url=document.location.origin #"http://ragapedia.com"
    to_html_doc(self.composition_parsed_doremi_script(),full_url,css,all_js)

  self.get_dom_fixer = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/js/from_doremi_script_base/dom_fixer.js'
      dataType:'text'
      success: (data) ->
        $('#dom_fixer_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
  
  self.get_zepto = () ->
    params=
      type:'GET'
      url:'/doremi-script-gui/js/from_doremi_script_base/third_party/zepto.unminified.js'
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

  self.redraw = () =>
    # TODO: factor parsing out to self.parse()
    try
      debug=false
      self.doremi_source(self.compute_doremi_source())
      count_before=self.lines().length
      console.log "redraw after compute_do_remi_source" if debug
      
      composition_view=self
      self.edit_line_open(false)
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
          console.log "composition parse failed, checking #{view_line.source()}" if debug
          try
            source=view_line.source()
            if /^\s*$/.test(source) or source is ""
              view_line.rendered_in_html('(empty line)')
              continue
            parsed_line=DoremiScriptLineParser.parse(source)
            view_line.rendered_in_html(line_to_html(parsed_line))
            view_line.line_parse_failed(false)
          catch err # line didn't parse
            view_line.line_parse_failed(true)
            view_line.line_has_warnings(false)
            view_line.line_warnings([])
            view_line.rendered_in_html("<pre>Didn't parse\n#{view_line.source()}</pre>")
            console.log(view_line.rendered_in_html()) if debug
      else # parse (on whole input) succeeded.
        composition_view.composition_parse_failed(false)
        composition_view.composition_parsed_doremi_script(parsed)
        parsed_lines=parsed.lines
        view_lines=composition_view.lines()
        ctr=0
        if parsed_lines.length isnt view_lines.length
          console.log "Info:assertion failed parsed_lines.length isnt view_lines.length" if debug
          #self.lines([])
          self.my_init(doremi_source)
          self.redraw()
          return # runs finally section below
        for parsed_line in parsed_lines
          view_line=view_lines[ctr]
          if /^\s*$/.test(view_line.source())
            view_line.rendered_in_html('(empty line)')
            continue
          view_line.line_parse_failed(false)
          view_line.rendered_in_html(line_to_html(parsed_line))
          warnings=parsed_line.line_warnings
          view_line.line_warnings(warnings)
          view_line.line_has_warnings(warnings.length > 0)
          ctr++
     catch err
       console.log "Error in redraw #{err}" #if debug
    finally
      self.hide_show_hyphenated_lyrics()
      app.setup_context_menu()

  for att in self.attribute_keys
    self[att].subscribe((new_value) ->
      self.doremi_source(self.compute_doremi_source())
      self.redraw() # TODO: review
    )

  self.my_init(my_doremi_source) if my_doremi_source?
  self
