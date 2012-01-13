\version "2.12.3"
\include "english.ly"
\header{   }

melody = {
\bar "|:"  c''4~ c''4~ c''4~ c''4 \bar ":|"  \break
 \bar "|"  d'4~ d'4~ d'4~ d'4 \bar "|"  \partial 4*1  \times 4/5 {  ef'16 ef'16 ef'16 ef'16 ef'16 } \break

}

\score{

<<
\new Voice = "one" {
  \melody
}
>>
\layout { }
}