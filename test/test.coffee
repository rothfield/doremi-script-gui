$(document).ready ->
  # | सरग़मपधऩस SrRgGmMPdDnN

  test_data=[]
  
  helper= (doremi_source,comments="") ->
    md5=MD5(doremi_source)
    result = (item for item in test_data when item.md5 is md5)
    alert("duplicate source #{test_data.length}: #{doremi_source}") if result.length > 0
    test_data.push({md5: md5, id: "test_#{test_data.length}", doremi_source: doremi_source, comments: comments})

  helper("""
         Hello world

         | (SRG)- R- S  | 
         ""","sargam-with hyphenated lyrics and melisma. Should put he-llo world under proper notes")
  helper("""
         Hello world

         | (CDE)- D- C-  | 
         ""","abc-with hyphenated lyrics and melisma. Should put he-llo world under proper notes")
  helper("""
         | S 
           john 
         ""","sargam-with syllable")
  helper("""
         | C 
           john 
         ""","abc-with syllable")
  helper("""
         | स 
           john 
         ""","devanagri-with syllable")
  helper("""
         SSS 
         ""","sargam-should generate a triplet")
  helper("""
         CCC 
         ""","abc-should generate a triplet")
  helper("""
         ससस 
         ""","devanagri-should generate a triplet")
  helper("""
         SSSSS
         ""","should generate a quintuplet")
  helper("""
         CCCCC 
         ""","should generate a quintuplet")
  helper("""
         ससससस 
         ""","devanagri-should generate a quintuplet")
  helper("""
                                            . .
         | SS#rR R#gGm mMPbP P#dDD#  | DnNN S S# S |
         ""","sargam chromatic sargam notes")
  helper("""
                                                 . .
         | CC#DbD D#EbEF FF#GbG G#AbAA# | ABbBB# C C# C |
         ""","abc chromatic sargam notes")
  helper "S"
  helper "C"
  helper "1"
  helper """
                   . .
         | SRGM PDNS SndP mgrS | 
         """
  helper """
                    . .
         | 1234# 5671 1765 4321
         """
  helper """
                    . .
         | CDEF# GABC CBbAbG FEbDbC
         """
  helper("Sr")
  helper("CDb")
  helper("12b")
  helper("Sr-g")
  helper("CDb-Eb")
  helper("12b-3b")
  helper("<S R >")
  helper("<C D >")
  helper("<1 2 >")
  helper("""
         Happy birthday

          PP DP
         
         """)
  helper("""
         Key: D
         Mode: Major

         Happy birthday

          PP DP
         
         """)
  helper("""
            NRSNS
            .  .
         | S 
         
         """)
  helper("""
           SNRSN
            .  .
         |      S 
         
         """)
  helper("""
         |: S :| 
         """)
  helper("""
                             1.__    2.___
         |: - - mm | G S R | G -  :| S - -  |
         ""","endings")
  helper("""
         S - - -
         ""","should generate whole note rather than 4 tied quarters")
  
  my_escape = (s) ->
    s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")

  generate_staff_notation_aux = (doremi_source,index=0,async=true) ->
    md5=MD5(doremi_source)
    selector="img#staff_notation_jpg_#{index}"
    selector3="span#staff_notation_jpg_span_#{index}"
    $(selector3).show()
    $(selector).css('visibility','hidden')
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
      fname: "test_case_#{md5}" #app.sanitize(self.title())
      html_doc: "stub" #self.generate_html_page_aux()
      doremi_source: doremi_source
      musicxml_source: ""
      dont_generate_staff_notation:false
    obj=
      dataType : "json",
      async: async,
      timeout : timeout_in_seconds * 1000  # milliseconds
      type:'POST'
      url: url
      data: my_data
      error: (some_data) ->
        alert("Couldn't connect to staff notation generator server at #{url}")
      success: (some_data,text_status) ->
        $(selector3).hide()
        $(selector).css('visibility','visible')
        console.log "in success, index is ", index
        if some_data.error
          #self.staff_notation_url(NONE_URL)
          #self.composition_lilypond_output_visible(true)
          $('h1.progress').text("Error: Regenerating image #{index}")
          #alert("An error occurred: #{some_data.lilypond_output}")
          return
        selector="img#staff_notation_jpg_#{index}"
        selector2="div#staff_notation_jpg_div_#{index}"
        img=$(selector)[0]
        ts=new Date().getTime()
        img.setAttribute('src',"#{img.getAttribute('src')}_#{ts}")
        $(selector2).effect("highlight", {}, 1000)
        fname=some_data.fname
        base_url=fname.slice(0,fname.lastIndexOf('.'))
        console.log base_url,fname # if debug
    $.ajax(obj)
  _.debug= () ->
  console.log test_data
  _.templateSettings =
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
  template = _.template """
                        <p>Test Case {{index}}</p>
                        <hr/>
                        <p>{{comments}}</p>
                        <pre title="doremi-script source">{{doremi_source}}</pre>
                        <hr/>
                        <div title="doremi-script rendered in html">
                        {{html}}
                        </div>
                        <hr/>
                        <div title="Staff notation generated by Lilypond" id="staff_notation_jpg_div_{{index}}">
                          <img id="staff_notation_jpg_{{index}}" alt="staff notation" 
                          class="staff_notation"
                          src="/compositions/test_case_{{md5}}.jpg?ts=">
                        <span style="display:none" id="staff_notation_jpg_span_{{index}}">
                        Please wait...
                         </span> 
                        </div>
                        <button class='generate_staff_notation' data-index='{{index}}'>Regenerate staff notation</button>
                        """
  recs= (for record,index in test_data
      try
        parsed=DoremiScriptParser.parse(record.doremi_source)
        html=to_html(parsed)
        record=
          comments: record.comments
          html: html
          doremi_source: my_escape(record.doremi_source)
          index:index
          md5:record.md5
        template(record)
      catch err
        record=
          comments: record.comments
          html: "Parse failed" 
          doremi_source: my_escape(record.doremi_source)
          index:index
      template(record)
  )
  hr="<hr style='height:4px;background-color:black;' />"
  $('content').html(hr + recs.join(hr))
  $('button.generate_staff_notation').click( (btn) ->
    $btn=$(this)
    index=parseInt($btn.data('index'))
    console.log "index",index
    record=test_data[index]
    parsed=DoremiScriptParser.parse(record.doremi_source)
    generate_staff_notation_aux record.doremi_source,index,true

  )
  $('button#regenerate_images').click( () ->
    $('h1.progress').text("Please wait")
    fun = () ->
      for record,index in test_data
        parsed=DoremiScriptParser.parse(record.doremi_source)
        generate_staff_notation_aux record.doremi_source,index,false
      $('h1.progress').text("Finished regenerating images")

    setTimeout(fun,1000)
  )
  dom_fixes()
