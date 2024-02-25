\version "2.20.0"
%All notation in one line
%Make sure whatever last note has an extra note for full duration
%meter will have extra beat
%paper width and line width will be number of beats (+extra beat) 

\paper
{
  paper-width = 3885 %105px per 36 beats +1 for last beat marking border 
  paper-height = 150

  top-margin = 0
  bottom-margin = 0
  left-margin = 0
  right-margin = 0
  
  system-system-spacing = #'((basic-distance . 15)  %this controls space between lines default = 12
                            (minimum-distance . 8)
                            (padding . 1)
                            (stretchability . 60)) 
}


\book
{

  \header
  {
    tagline = ##f %Do not display tagline
  }

  \score
  {
    <<

      \override Score.BarNumber.break-visibility = ##(#f #f #f) %The order of the three values is end of line visible, middle of line visible, beginning of line visible.
     
     
      
     
      \new Staff \with 
      {
        \omit TimeSignature
        \omit BarLine
        \omit Clef
        \omit KeySignature
        \override StaffSymbol.thickness = #1 %thickness of stafflines, ledger lines, and stems
        % \accidentalStyle dodecaphonic  modern modern-cautionary neo-modern default http://lilypond.org/doc/v2.18/Documentation/notation/displaying-pitches#automatic-accidentals
      }

      {
        \override TupletBracket.bracket-visibility = ##t
        \override TupletBracket.padding = 3
        \override TupletNumber.visibility = ##f
        \set tupletFullLength = ##t %http://lilypond.org/doc/v2.19/Documentation/snippets/rhythms
        \override NoteHead.font-size = #-2.5
        \override DynamicText.font-size = #-2
        \override Stem.details.beamed-lengths = #'(9)
        \override Stem.details.lengths = #'(9)
        % \override NoteColumn.accent-skip = ##t
        \override Accidental.font-size = -2 
        \override Stem.direction = #up
        \stopStaff % Hides staff lines
        \set Score.tempoHideNote = ##t
        %\override Stem.transparent = ##t 
        \override Score.Script.font-size = #-2 %change articulation font size
        
        
        %%%%%%% SCORE BEGINS HERE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
       
       %36 Beats (+1) = 37 beats - 4 Lines - 9 beats per line - 945 px line width - 3780px for whole notation + 1 = 2923 - 79 px per beat
        \tempo 4 = 60
        \time 37/4
        %3885/3780
        
        %1
        r4
        
        %2-5
        % 4-Beat Acceleration - add extra beams in inkscape: duplicate beam, use Atl+[ to rotate 1deg at a time, then Align left and top
        \once \override Beam.grow-direction = #RIGHT
        \featherDurations #(ly:make-moment 11/15) { e'8 [ e' e' e' e' e' e' e' ] } %4 beats accel  
        
        %6-8 curve
        \once \hideNotes
        r2.
        
        %9-12
        \once \override TupletNumber #'text = "5:1"
        \tuplet 5/4 {[b'16 c''' r r d' ]}
        
        d''8 r g'16 d'''8.~d'''4
        
        %13-14.5 bar
        \hideNotes
        r2 r8 \unHideNotes
        
        %15-17
        r8 r4 r4
        
        
        
        
        %18-19
        \grace  {  
          \override NoteHead.font-size = #-8
          [ b'32  d''  ] 
        }
        \override NoteHead.font-size = #-2
        
        \once \override Stem.direction = #down
        \afterGrace  4/3
        e''16 -^
        { 
          \override NoteHead.font-size = #-8
          [ c'''32    b'' e''    c''  ]
        }
        \override NoteHead.font-size = #-2
        
        r8. r4
        
        
        %20-24 %curve
         \hideNotes
        r1 r4 \unHideNotes %curve
        
        %25
        r4
        
        
        
       %26-29
        
          %3/4 before
        \hideNotes e''2. \unHideNotes
        \grace  {  
          \override NoteHead.font-size = #-8
          [ e''32 <d'' f''>  <d'' f''>  <d'' f''> <c'' e'' g''>  <c'' e'' g''>   <c'' e'' g''>  <c'' e'' g''>   <b' d'' f'' a''>  <b' d'' f'' a''>  <b' d'' f'' a''>  <b' d'' f'' a''>  <a' c'' e'' g'' b''>  <a' c'' e'' g'' b''>  <a' c'' e'' g'' b''>  <a' c'' e'' g'' b''>  <g' b' d'' f'' a'' c''' >   <g' b' d'' f'' a'' c''' >  <g' b' d'' f'' a'' c''' > <g' b' d'' f'' a'' c''' >      <f' a' c'' e'' g'' b'' d'''> <f' a' c'' e'' g'' b'' d'''>   <f' a' c'' e'' g'' b'' d'''> <f' a' c'' e'' g'' b'' d'''>   <e' g' b' d'' f'' a'' c''' e''' > <e' g' b' d'' f'' a'' c''' e''' >   <e' g' b' d'' f'' a'' c''' e''' > <e' g' b' d'' f'' a'' c''' e''' >    <d' f' a' c'' e'' g'' b'' d''' f'''>  <d' f' a' c'' e'' g'' b'' d''' f'''>   <d' f' a' c'' e'' g'' b'' d''' f'''>        < c' e' g' b' d'' f'' a'' c''' e''' g'''>     < c' e' g' b' d'' f'' a'' c''' e''' g'''>        <b d' f' a' c'' e'' g'' b'' d''' f''' a'''> <b d' f' a' c'' e'' g'' b'' d''' f''' a'''>      <a c' e' g' b' d'' f'' a'' c''' e''' g''' b'''>              <g b d' f' a' c'' e'' g'' b'' d''' f''' a''' c''''>            <a c' e' g' b' d'' f'' a'' c''' e''' g''' b'''>       <b d' f' a' c'' e'' g'' b'' d''' f''' a'''> <b d' f' a' c'' e'' g'' b'' d''' f''' a'''>   < c' e' g' b' d'' f'' a'' c''' e''' g'''>     < c' e' g' b' d'' f'' a'' c''' e''' g'''>        <d' f' a' c'' e'' g'' b'' d''' f'''>  <d' f' a' c'' e'' g'' b'' d''' f'''>   <d' f' a' c'' e'' g'' b'' d''' f'''>    <e' g' b' d'' f'' a'' c''' e''' >  <e' g' b' d'' f'' a'' c''' e''' ><e' g' b' d'' f'' a'' c''' e''' > <e' g' b' d'' f'' a'' c''' e''' >        <f' a' c'' e'' g'' b'' d'''>  <f' a' c'' e'' g'' b'' d'''>   <f' a' c'' e'' g'' b'' d'''> <f' a' c'' e'' g'' b'' d'''>    <g' b' d'' f'' a'' c''' >     <g' b' d'' f'' a'' c''' >  <g' b' d'' f'' a'' c''' >  <g' b' d'' f'' a'' c''' >   <a' c'' e'' g'' b''>  <a' c'' e'' g'' b''> <a' c'' e'' g'' b''>  <a' c'' e'' g'' b''>  <b' d'' f'' a''>  <b' d'' f'' a''> <b' d'' f'' a''>  <b' d'' f'' a''>  <c'' e'' g''>  <c'' e'' g''> <c'' e'' g''>  <c'' e'' g''>  <d'' f''>  <d'' f''> <d'' f''>   e''   ]
        } 
        \override NoteHead.font-size = #-2
        \once \override Stem.direction = #down
        e''8 -^  r8
        

        
%         30-31
        r4 r 
        
        %32-36
          \hideNotes
        r1 r4 \unHideNotes %bar
         
   %NEXT MAKE SVG INKSCAPE
        
       \once  \override Stem.direction = #down
         b'4
        
        %%%%% END SCORE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        
        
        
        
      }

    >>


    \layout
    {
      \context
      {
        \Score
        proportionalNotationDuration = #(ly:make-moment 1/35) 
        \override SpacingSpanner.uniform-stretching = ##t
        \override SpacingSpanner.strict-note-spacing = ##t
        % \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
        % \override NoteHead.no-ledgers = ##t 
      }

      indent = 0
      line-width = 3885  
      #(layout-set-staff-size 33) %staff height
      % \hide Stem
      %\hide NoteHead
      % \hide LedgerLineSpanner
      % \hide TupletNumber 
    }

    \midi{}

  }
}

