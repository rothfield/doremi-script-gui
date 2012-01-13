\version "2.12.3"

melody = {
\bar "|:"  c''4 \bar ":|"  \break
\bar "|" c |
}

\score{

<<
\new Voice = "one" {
  \melody
}
>>
\layout { }
}
