assign_attributes:ornaments are: [object Object]
 #(ly:set-option 'midi-extension "mid")
 \version "2.12.3"
 \include "english.ly"
 \header{ 
 title = "numberornaments"
 
 tagline = ""  % removed 
 }
%{
id: 1331412144048
Title: numberornaments
Filename: untitled
Key: C
Mode: ionian
TimeSignature: 4/4
ApplyHyphenatedLyrics: true
StaffNotationURL: images/none.png

  <23>
   .
| 3     - - - |  
%}
melody = {
\clef treble
\key c \ionian
\time 4/4
\autoBeamOn  
| \afterGrace e'4~ { d32[ e'32] } e'4~ e'4~ e'4 | \break

}

text = \lyricmode {
 
}

\score{

<<
 \new Voice = "one" {
   \melody
 }
 \new Lyrics \lyricsto "one" \text
>>
\layout {
 \context {
      \Score
   \remove "Bar_number_engraver"
 } 
 }
\midi { 
 \context {
   \Score
   tempoWholesPerMinute = #(ly:make-moment 200 4)
  }
}
}
