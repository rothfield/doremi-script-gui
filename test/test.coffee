$(document).ready ->
  my_escape = (s) ->
    s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")

  generate_staff_notation_aux = (doremi_source,index=0,dont="false") ->
    console.log "generate_staff_notation" if debug
    # generate staff notation by converting doremi_script
    # to lilypond and call a web service
    # TODO: 
    # ?? get rid of lilypond_source param and musicxml_source
    # I don't trust any lilypond...
    ts= new Date().getTime()
    url='/lilypond_server/lilypond_to_jpg'
    timeout_in_seconds=60
    my_data =
      fname: "test_case_#{index}" #app.sanitize(self.title())
      html_doc: "stub" #self.generate_html_page_aux()
      doremi_source: doremi_source
      musicxml_source: ""
      dont_generate_staff_notation:dont
    obj=
      dataType : "json",
      async: false,
      timeout : timeout_in_seconds * 1000  # milliseconds
      type:'POST'
      url: url
      data: my_data
      error: (some_data) ->
        alert("Couldn't connect to staff notation generator server at #{url}")
      success: (some_data,text_status) ->
        console.log "in success, index is ", index
        if some_data.error
          #self.staff_notation_url(NONE_URL)
          #self.composition_lilypond_output_visible(true)
          $('h1.progress').text("Error: Regenerating image #{index}")
          #alert("An error occurred: #{some_data.lilypond_output}")
          return
        fname=some_data.fname
        base_url=fname.slice(0,fname.lastIndexOf('.'))
        console.log base_url if debug
    $.ajax(obj)
  _.debug= () ->
  test_data=[]
  helper= (doremi_source,comments="") ->
    test_data.push({id: "test_#{test_data.length}", doremi_source: doremi_source, comments: comments})
  helper("""
         S
         ""","")
  helper("Sr","")
  helper("Srg","")
  helper("Sr-g","")
  helper("<S R >","")
  helper("""
         Happy birthday

          PP DP
         
         ""","")
  helper("""
         Key: D
         Mode: Major

         Happy birthday

          PP DP
         
         ""","")
  helper("""
            NRSNS
            .  .
         | S 
         
         ""","")
  
  console.log test_data
  recs= (for record,index in test_data

    parsed=DoremiScriptParser.parse(record.doremi_source)
    console.log "parsed",parsed
    #generate_staff_notation_aux record.doremi_source,index
    img="""
        <img alt="staff notation" class="staff_notation" src="/compositions/test_case_#{index}.jpg">
        """
    html=to_html(parsed)
    src="<pre>#{my_escape(record.doremi_source)}</pre>"
    "#{src}<hr/>#{html}<hr/>#{img}"
  )
  $('content').html(recs.join("<hr style='height:4px;background-color:black;' />"))
  $('button#regenerate_images').click( () ->
    $('h1.progress').text("Please wait")
    fun = () ->
      for record,index in test_data
        parsed=DoremiScriptParser.parse(record.doremi_source)
        generate_staff_notation_aux record.doremi_source,index 
      $('h1.progress').text("Finished regenerating images")

    setTimeout(fun,1000)
  )
  dom_fixes()
