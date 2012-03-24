$(document).ready ->
  debug=false
  window.doremi_script_gui_app={}
  app=window.doremi_script_gui_app
  simple_hash = (str) ->
    return 0 if !str?
    num=0
    for ch, index in str.split ''
      num=num + ch.charCodeAt(0)
    "#{num}"
      
  ko.bindingHandlers.rendered_doremi_script =
    update: (element,value_accessor,all_bindings_accessor) ->
      old_hash=$(element).attr('data-hash')
      new_value=ko.utils.unwrapObservable(value_accessor())
      new_hash=simple_hash(new_value)
      if old_hash isnt new_hash
        $(element).html(new_value)
        dom_fixes($(element))
        $(element).attr('data-hash',new_hash)

  app.setup_context_menu = () ->
     composition=app.the_composition
     if composition.disable_context_menu()
       return false
     console.log('setup_context_menu') if debug
     fun = (action, original_element, pos) ->
       el=$(original_element).parentsUntil('div.stave_wrapper').last().parent()
       #console.log("els",els)
       return if el.size is 0
       #el=$(els[0]).parent().parent().parent()
       console.log("el",el)
       stave_id=$(el).attr("id")
       console.log "el",el
       found=null
       found=line for line in app.the_composition.lines() when line.stave_id() is stave_id
       console.log(action,el,pos) if debug
       console.log "found is",found if debug
       if (action is "delete")
         if confirm("Are you sure you want to delete this line:\n\n#{found.source()}?")
           app.the_composition.delete_line(found)
         return
       if (action is "edit")
         found.edit()
         return
       if (action is "insert")
         app.the_composition.composition_insert_line(found)
         return
       if (action is "append")
         app.the_composition.composition_append_line(found)
         return
     $(".note_wrapper").contextMenu({ menu: 'my_menu' }, fun)
     $(".lyrics_section").contextMenu({ menu: 'my_menu' }, fun)

  app.sanitize= (name)->
     name.replace(/[^0-9A-Za-z.\-]/g, '_').toLowerCase()

  setup_downloadify = () ->
    console.log "entering setup_downloadify" if debug
    app.params_for_download_lilypond =
    	filename: () ->
        "#{app.the_composition.filename()}.ly"
      data: () ->
        app.the_composition.composition_lilypond_source()
  	  onComplete: () ->
        console.log 'Your File Has Been Saved!' if debug

      swf: './js/downloadify/downloadify.swf'
      downloadImage: './images/save.png'
      height:19
      width:76
      transparent:false
      append:false
      onComplete: () ->
        alert("Your file was saved")
    app.params_for_download_sargam= _.clone(app.params_for_download_lilypond)
    app.params_for_download_sargam.data = () ->
        if app.the_composition.composition_parse_failed()
          alert("Please fix errors before saving")
          return ""
        app.the_composition.doremi_source()

    app.params_for_download_sargam.onError = () ->
      # onError: Called when the Download button is clicked but your data callback returns "".
      
    app.params_for_download_sargam.filename = () ->
      "#{app.sanitize(app.the_composition.title())}.doremi_script.txt"
    $("#download_lilypond").downloadify(app.params_for_download_lilypond)
    $("#save").downloadify(app.params_for_download_sargam)
    #   $("#download_musicxml_source").downloadify(params_for_download_musicxml)
  
  initialData = "Title: testing\nAuthor: anon\nApplyHyphenatedLyrics: true\nmany words aren't hyphenated\n\n| SRG- m-m-\n. \n\n|PDNS"
  initialData = ""
  debug=false

  app.message_box= (str) ->
    alert(str)

  app.full_url_helper = (fname) ->
    loc=document.location
    "#{loc.protocol}//#{loc.host}#{fname}"

  window.the_composition=new CompositionViewModel()
  # TOODO: move away from window.the_composition
  app.the_composition=window.the_composition
  window.the_composition.help_visible(false)
  #window.the_composition.my_init(initialData)
  ko.applyBindings(window.the_composition,$('html')[0])
  
  $(window).resize(() ->
    # redraw the composition
    console.log("resize")
    window.the_composition.composition_stave_width(window.the_composition.calculate_stave_width())
    window.the_composition.composition_textarea_width(window.the_composition.calculate_textarea_width())
    $('div.stave').attr('data-dom-fixed',"false")
    window.the_composition.redraw()
  )


  getParameterByName= (name) ->
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
    regexS = "[\\?&]" + name + "=([^&#]*)"
    regex = new RegExp(regexS)
    results = regex.exec(window.location.search)
    if(results is null)
        return ""
    return decodeURIComponent(results[1].replace(/\+/g, " "))

  check_for_opening_url=() ->
    load_url(getParameterByName('url'))

  load_composition_from_url= (url) ->
    return if url is ""
    params=
      type:'GET'
      url:url
      dataType:'text'
      success: (doremi_script_source) =>
        app.the_composition.my_init(doremi_script_source)
        app.the_composition.redraw()
      error: (data) ->
        alert("Unable to load url #{url}")
    $.ajax(params)

  setup_downloadify()
  $('#composition_title').focus()

  console.log("before get_css") if false
  # these are used for creating html_doc. Review whether still needed.
  load_html_doc_components= () ->
    app.the_composition.get_application_css()
    app.the_composition.get_styles_css()
    app.the_composition.get_doremi_css()
    app.the_composition.get_zepto()
    app.the_composition.get_dom_fixer()

  load_html_doc_components()
  url= getParameterByName('url')
  if url isnt ""
    load_composition_from_url(url)
