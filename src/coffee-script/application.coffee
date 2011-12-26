Logger=_console.constructor
# _console.level  = Logger.DEBUG
_console.level  = Logger.WARN
_.mixin(_console.toObject())



initialData = [
  { source: "| S - - - |", rendered_in_html: "<em>S</em>"},
  { source: "| r - - - |", rendered_in_html: "<em>r</em>"}
]
 
CompositionModel = (lines) ->
  self = this
  self.raga=ko.observable("")
  self.author=ko.observable("")
  self.source=ko.observable("")
  self.time=ko.observable("")
  self.filename=ko.observable("")
  self.title=ko.observable("untitled")
  self.keys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"]
  self.key= ko.observable("C")
  self.modes=["Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"]
  self.mode= ko.observable("Ionian")
  fun = (line) ->
    last_value_rendered: ""
    source: line.source
    #rendered_in_html: line.rendered_in_html #ko.observable(line.rendered_in_html) #line.rendered_in_html
    rendered_in_html: ko.observable(line.rendered_in_html) 

    handle_key_press: (current_line,event) ->
      let_default_action_proceed=true
      let_default_action_proceed

  self.lines = ko.observableArray(ko.utils.arrayMap(lines, fun))

  self.addLine = () ->
    self.lines.push(fun({
            source: "",
            rendered_in_html: ""
        }))

  self.removeLine = (line) ->
        self.lines.remove(line)
 
  self.save = () ->
    #self.lastSavedJson(JSON.stringify(ko.toJS(self.lines), null, 2))
    self.lastSavedJson(JSON.stringify(ko.toJS(self), null, 2))
 
  self.lastSavedJson = ko.observable("")

  self

window.the_composition=new CompositionModel(initialData)
ko.applyBindings(window.the_composition)

window.timed_count = () =>
  found=null
  src=null
  for line in window.the_composition.lines()
    found=line if line.last_value_rendered isnt  (src=line.source)
    break if found
  if found?
    try
      result=DoremiScriptLineParser.parse(src)
      found.rendered_in_html(line_to_html(result))
      dom_fixes()
    catch err
      result="failed"
      found.rendered_in_html("parsing failed")
    finally
      found.last_value_rendered=src
  t=setTimeout("timed_count()",1000)

window.zdo_timer  =  () =>
  if !window.timer_is_on
    window.timer_is_on=1
    window.timed_count()


window.timed_count()
