noit o' mnain worb
==================

Language version 1.1. Distribution version 2018.0123.  
Copyright ©2000-2018, Chris Pressey, Cat's Eye Technologies.  
All rights reserved.

What is this?
-------------

This is the reference distribution of *noit o' mnain worb*, a
probabilistic particle automaton described (awkwardly) in the next
section.

It contains the reference implementation, as a Perl script which
uses the (included) Console::Virtual library, in the `script`
directory.

It also contains an implementation in Javascript/HTML5, using
modules (also included) from [yoob.js](https://github.com/catseye/yoob.js),
in the `impl/worb.js` directory.

It used to contain, but no longer contains, an implementation in Java.
This implementation can now be found in
[the yoob distribution](https://github.com/catseye/yoob).

What is noit o' mnain worb?
---------------------------

The noit o' mnain worb language is a probabilistic particle automaton
based on brownian motion (or entropy).

A noit o' mnain worb runtime has an orthogonal gridwork playfield (of
any reasonable size or number of dimensions) which is populated by any
number of bobules. Bobules are solid elements in this grid — that is, no
two bobules may occupy the same location. Bobules are also capable of
motion — in fact they can hardly avoid it — and it is important to note
that they are stateless. As such, they have no idea which direction they
are going, nor what they are going to do when they get there.

Each time quantum, or tick, each bobule chooses an adjacent square to
move to, at random (in two dimensions, that's 8 possibilities plus the
possibility of not moving = 9 possibilities.) If, during some tick, this
randomly-chosen new location does not allow entry — that is, if it is
already occupied by a solid element (a bobule or a wall) — the bobule
does not move during that tick.

[Implementation note: each tick that a bobule is blocked from moving,
its "pressure" increases, although this is merely for visual effect.]

The playfield is made more interesting by the addition of:

-   `#` *walls* which are merely static solid elements that take up space
    and do not move;
-   `^v><` *diodes* which disallow bobules from passing through them
    backwards;
-   `+-` *sources & sinks* which represent large repositories or vacancies
    of bobules; and
-   `!` *loads* which represent something that the bobules can 'do'.

Notes
-----

[Historical note: In version 1.0 (Jul 5 2000) of the language, which was
released only on the Cat's Eye Technologies Mailing List, `+-` had much
different (and much more myopic) semantics than they do in v1.1.]

The sources and sinks are simply convenient 'macros', so that you can
build something like:

      ###
    ###+###

instead of saying something like:

    #######
    #.....#
    #.....#
    #.....#
    ###.###
      #.#
    ###v###

Using the `+` sources and `-` sinks simply saves you from specifying
large chambers of bobules or emptiness explicitly.

[Implementation note: It is not the intention of the `+` element to
violate entropy, but the fact that, in the reference implementation, `+`
keeps producing bobules indefinately at a uniform rate of 10% chance per
tick does bend the rules a bit. In a more "entropically correct"
implementation, the chance per tick should decrease over time. Note that
the language proper does not specify any particular rate of bobule
creation, but encourages implementations to be flexible on this point.]

The `!` loads simply cause the implementation to react in some noticable
way when a bobule enters into their location, so that the noit o' mnain
worb programmer can pretend to themselves that their bobules are 'doing
something' during program runs.

[Implementation note: The reference interpreter simply outputs an ASCII
BEL character when this happens. On most terminals, this affects a
beeping sound.]

The idea is that the bobules, spaces, walls, and diodes alone constitute
a (nearly) Turing-Complete system¹.

I say "nearly" because it's actually missing a dimension in this form.
The noit o' mnain worb language isn't dimensionally-independent.
Notably, it doesn't work in one dimension at all.

It *almost* works in two dimensions, but the fact is that if you do not
address the 'wire-crossing problem' (see
[Befunge-93](http://catseye.tc/projects/befunge93/)'s `#` instruction),
you cannot guarantee being able to connect two arbitrarily-chosen paths
in two dimensions. You need to have a way for coincident paths to cross,
which is not strictly just two dimensions anymore.

[Theoretical note: we suspect, but would surely have a hard time
proving, that this limitation is somehow related to the four-colour map
theorem.]

So, it really only works in three dimensions and above. For that reason,
adding 'wormholes' to the noit o' mnain worb playfield is a possible
future extension, to simulate three dimensions a la 'wire crossing'.

- - - -

¹given a playfield which is initially populated with a suitable infinite
pattern, of course, à la Wireworld and such.
