$ = jQuery

root = exports ? this

$(document).ready ->


  handleFileSelect = (evt) =>
    console.log "in handleFileSelect" if debug
    file = document.getElementById('file').files[0]
    console.log "in handleFileSelect,file is",file if debug
    reader=new FileReader()
    reader.onload =  (evt) ->
      $('#entry_area').val evt.target.result
      $('#lilypond_png').attr('src',"")

    reader.readAsText(file, "")


  document.getElementById('file').addEventListener('change', handleFileSelect, false)


  root.debug=false
  debug=false
  # TODO: don't use window. Use an application object
  window.timer_is_on=0
  window.last_val=str
  
  window.timed_count = () =>
    console.log("entering timed_count") if debug
    cur_val= $('#entry_area').val()
    console.log "Entering timed_count, cur_val = #{cur_val}" if debug
    if window.last_val != cur_val
      console.log("timed_count- runnng parser since val changed") if debug
      $('#run_parser').trigger('click')
    t=setTimeout("timed_count()",1000)

  window.do_timer  =  () =>
    console.log("entering do_timer") if debug
    if !window.timer_is_on
      console.log("window.timer wasnt on") if debug
      window.timer_is_on=1
      window.timed_count()
  long_composition = '''
Rag:Bhairavi
Tal:Tintal
Title:Bansuri
Source:AAK
Mode: phrygian
           . .
[| Srgm PdnS SndP mgrS |]

           I  IV            V   V7 ii    iii7 
               3                  +            2          .
1)|: S S S (Sr | n) S   (gm Pd) | P - P  P   | P - D  <(nDSn)>) |
                 .
            ban-    su-  ri       ba- ja ra-   hi  dhu- na

  0  ~                3               ~       +  .     *  *   
| P  d   P       d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |
     ma- dhu-ra  kan-     nai-        ya      khe-     la-ta

    2              0     
                   ~
| (d-Pm  g) P  m | r - S :|
   ga-      wa-ta  ho- ri

  '''
  str="S"
  str1 = '''
                            I   IV       V   V7 ii  iii7 
         3                  +            2          .
  |: (Sr | n) S   (gm Pd) | P - P  P   | P - D  (<nDSn>) |
           .
      ban-    su-  ri       ba- ja ra-   hi  dhu- na
  
    0  ~                3           ~       +  .     *  .
  | P  d   P   d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |
    ma-dhu-ra  kan-     nai-        ya      khe-     la-ta
  '''
  str= '''
      I                       IV             V
                   .  .   .    . ..
  |: (SNRSNS) N    S--S --S- | SNRS N D P || mm GG RR S-SS :|  
      .   .   .
      he-     llo
  '''
  str = '''
  Rag:Bhairavi
  Tal:Tintal
  Title:Bansuri
  Source:AAK

            3             ~    +            2         .
  1) |: (Sr | n) S   (gm Pd)|| P - P  P   | P - D  (<nDSn>) |
              .
         ban-    su-  ri       ba- ja ra-   hi  dhu- na

  0                 3                    +     .    *  .
  | P  d   P   d    | <(Pm>   PmnP) (g m)|| PdnS -- g  S |
    ma-dhu-ra  kan-     nai-         ya     khe-    la-ta

  2              0     ~
  |  d-Pm g P  m | r - S :|
     ga-    wa-ta  ho- ri

        I                     IV
                . .                   . .
  2)  [| Srgm PdnS SndP mgrS | Srgm PdnS SndP mgrS | % | % |]
  '''
  str_simple = '''
     + 
     .
  |<(S--  r)>  (r---  g-m) | S
     test-ing
  '''
  str=str1
  str="S--R --G- | -m-- P"
  $('#entry_area').val(str)
  # window.last_val=$('#entry_area').val()
  parser=SargamParser
  # uses coffeescripts classes
  renderer=new SargamHtmlRenderer
  #staff_renderer=new VexflowRenderer
  window.parse_errors=""

  params_for_download_lilypond =
  	filename: () ->
      "#{window.the_composition.filename}.ly"
    data: () ->
      window.the_composition.lilypond
	  onComplete: () ->
      console.log 'Your File Has Been Saved!' if debug
    swf: 'js/third_party/downloadify/media/downloadify.swf'
    downloadImage: 'images/download.png'
    height:30
    width:100
    transparent:true
    append:false
    onComplete: () ->
      alert("Your file was saved")
  params_for_download_sargam= _.clone(params_for_download_lilypond)
  params_for_download_sargam.data = () ->
    $('#entry_area').val()
  params_for_download_sargam.filename = () ->
    "#{window.the_composition.filename}.txt"
  ###
	  onComplete: () ->
      console.log 'Your File Has Been Saved!'
    swf: 'js/third_party/downloadify/swfobject.js'
    downloadImage: 'images/download.png'
    height:30
    width:100
    transparent:true
    append:false
  Downloadify 'download_lilypond',params_for_downloadify
  ###
  $("#download_lilypond").downloadify(params_for_download_lilypond)
  $("#download_sargam_source").downloadify(params_for_download_sargam)
  $('#load_long_composition').click ->
    $('#entry_area').val(long_composition)
  $('#load_sample_composition').click ->
    $('#entry_area').val(str)
  $('#show_parse_tree').click ->
      $('#parse_tree').toggle()
  my_url="lilypond.txt"
 # url="hlilypond"

  $('.generate_staff_notation').click =>
    console.log  "my_url is #{my_url}" if debug
    my_response_func= (resp) ->
      console.log "resp is #{resp}" if debug
    obj=
      type:'POST'
      url:my_url
      data:{data:window.the_composition.lilypond}
      error: ->
        alert "Generating staff notation failed"
        $('#lilypond_png').attr('src','none.jpg')
      success: (some_data,text_status) ->
        console.log "in success,data.length is",some_data.length if debug
        $('#lilypond_png').attr('src',some_data)
        window.location.hash="staff_notation";
        $('#staff_notation_link').trigger('click')
      dataType: "text"
    $.ajax(obj)

  $('#show_lilypond_source').click ->
    $('#lilypond_source').show()
    $('#lilypond_source').text(window.the_composition.lilypond)
  $('#run_parser').click ->
    return if parser.is_parsing

    window.parse_errors=""
    $('#parse_tree').text('parsing...')
    try
      parser.is_parsing=true
      obj= parser.parse $('#entry_area').val()
      window.the_composition=obj
      console.log("result of parser.parse(str)",obj) if debug
      $('#parse_tree').text("Parsing completed with no errors \n"+JSON.stringify(obj,null,"  "))
      $('#parse_tree').hide()
      $('#rendered_sargam').html(renderer.to_html(obj))
      $('span[data-begin-slur-id]').each  (index) ->
        console.log("this is",$(this).text()) if debug
        pos2=$(this).offset()
        console.log("pos2",pos2) if debug
        attr=$(this).attr("data-begin-slur-id")
        console.log("attr",attr) if debug
        slur=$("##{attr}")
        console.log("slur",slur) if debug
        pos1=$(slur).offset()
        console.log("pos1",pos1) if debug
        $(slur).css({width: pos2.left- pos1.left + $(this).width()})
      canvas = $("#rendered_in_staff_notation")[0]
      console.log("canvas is",canvas) if debug
    catch err
      console.log err
      #staff_renderer.render(canvas,obj)
      window.parse_errors= window.parse_errors + "\n"+ err
      $('#parse_tree').text(window.parse_errors)
      $('#parse_tree').show()
    finally
      window.last_val=$('#entry_area').val()
      parser.is_parsing=false

  # $('#load_sample_composition').trigger('click')
  $('#run_parser').trigger('click')
  $('#parse_tree').hide()




  window.do_timer()


