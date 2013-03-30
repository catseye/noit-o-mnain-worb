#!/usr/bin/env perl

# noit o' mnain worb - fungeoid language based on brownian motion
# v2007.1123 Chris Pressey, Cat's Eye Technologies

# Copyright (c)2000-2007, Chris Pressey, Cat's Eye Technologies.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
#
#  1. Redistributions of source code must retain the above copyright
#     notices, this list of conditions and the following disclaimer.
#  2. Redistributions in binary form must reproduce the above copyright
#     notices, this list of conditions, and the following disclaimer in
#     the documentation and/or other materials provided with the
#     distribution.
#  3. Neither the names of the copyright holders nor the names of their
#     contributors may be used to endorse or promote products derived
#     from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
# FOR A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE
# COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
# BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
# LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
# ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.

# usage: [perl] worb[.pl] [-delay ms] worb-playfield-file
# requirements: ANSI terminal emulation, for animation.

# history: v1.0 Jul  5 2000 - original release.
#          v1.1 Jul 19 2000 - changed + and -
#                             optimized display routine for ANSI
#                             optimized is_bobule_at (cached)
#                             relicensed & released on web site
#          v2007.1123       - adapted to use Console::Virtual
#                           - added strict qw(vars refs subs)
#                           - added delay in ms cmdline option
#                           - fixed hashbang line
#                           - updated BSD license (no "REGENTS")

use strict qw(vars refs subs);

# This allows us to keep Console::Virtual in a subrepo located in
# the lib dir of this project
BEGIN
{
  use File::Spec::Functions;
  use File::Basename;
  push @INC, catdir(dirname($0), '..', 'lib', 'console-virtual');
}

# Uncomment these lines to use specific display/input/color drivers.
# BEGIN { $Console::Virtual::setup{display} = 'ANSI'; }
# BEGIN { $Console::Virtual::setup{input} = 'Teletype'; }
# BEGIN { $Console::Virtual::setup{color} = 'ANSI16'; }

use Console::Virtual 2.0
     qw(getkey display gotoxy clrscr clreol
        normal inverse bold update_display color
        vsleep);

### GLOBALS ###

my @bobule = ();
my @source = ();
my @sink = ();
my @playfield = ();

my @bobule_at_cache = ();

my $x = 0;
my $y = 0;

my $maxx = 1;
my $maxy = 1;

my $delay = 100;

### SUBS ###

sub draw_playfield
{
  my $i; my $j; my $p;
  for($j = 0; $j <= $maxy; $j++)
  {
    gotoxy(1, $j+1);
    for($i = 0; $i <= $maxx; $i++)
    {
      if ($p = is_bobule_at($i,$j))
      {
        if ($p == 1) { display '.'; }
        elsif ($p >= 2 and $p <= 3) { display 'o'; }
        elsif ($p >= 4 and $p <= 6) { display 'O'; }
        elsif ($p >= 7 and $p <= 10) { display '0'; }
        else { display '@'; }
      } else
      {
        display($playfield[$i][$j] or ' ');
      }
    }
  }
}

sub is_bobule_at
{
  my $x = shift; my $y = shift;
  return $bobule_at_cache[$x][$y] || 0;
}

sub get_bobule_number_at
{
  my $x = shift; my $y = shift;
  my $i;
  for ($i = 0; $i <= $#bobule; $i++)
  {
    return $i if $bobule[$i][0] == $x and $bobule[$i][1] == $y;
  }
  return undef;
}

sub vacant
{
  my $x = shift; my $y = shift;
  return 0 if $playfield[$x][$y] eq '#';
  return 0 if is_bobule_at($x,$y);
  return 1;
}

### MAIN ###

while ($ARGV[0] =~ /^\-\-?(.*?)$/)
{
  my $opt = $1;
  shift @ARGV;
  if ($opt eq 'delay')
  {
    $delay = 0+shift @ARGV;
  }
  else
  {
    die "Unknown command-line option --$opt";
  }
}

my $line;

open PLAYFIELD, $ARGV[0];
while(defined($line = <PLAYFIELD>))
{
  my $i;
  chomp($line);
  for($i = 0; $i < length($line); $i++)
  {
    my $c = substr($line, $i, 1);
    if ($c eq '.')
    {
      $c = ' ';
      push @bobule, [$x, $y, 1];
      $bobule_at_cache[$x][$y] = 1;
    }
    elsif ($c eq '+')
    {
      push @source, [$x, $y];
    }
    elsif ($c eq '-')
    {
      push @sink, [$x, $y];
    }
    $playfield[$x][$y] = $c;
    $x++; if ($x > $maxx) { $maxx = $x; }
  }
  $x = 0;
  $y++; if ($y > $maxy) { $maxy = $y; }
}
close PLAYFIELD;

clrscr();
color('white', 'black');
draw_playfield();
update_display();

my $new_x;
my $new_y;

while (1)
{
  my $bobule; my $pole;
  foreach $bobule (@bobule)
  {
    $bobule->[2]++;
    if ($bobule->[2] == 2 or $bobule->[2] == 4 or $bobule->[2] == 7 or $bobule->[2] == 11)
    {
      my $p = $bobule->[2];
      gotoxy($bobule->[0]+1, $bobule->[1]+1);
      if ($p == 2) { display 'o'; }
      elsif ($p == 4) { display 'O'; }
      elsif ($p == 7) { display '0'; }
      elsif ($p == 11) { display '@'; }
    }
    $new_x = $bobule->[0] + int(rand(1) * 3)-1;
    $new_y = $bobule->[1] + int(rand(1) * 3)-1;
    next if not vacant($new_x, $new_y);
    next if $playfield[$new_x][$new_y] eq '<' and $bobule->[0] < $new_x;
    next if $playfield[$new_x][$new_y] eq '>' and $bobule->[0] > $new_x;
    next if $playfield[$new_x][$new_y] eq '^' and $bobule->[1] < $new_y;
    next if $playfield[$new_x][$new_y] eq 'v' and $bobule->[1] > $new_y;
    next if $new_x == $bobule->[0] and $new_y == $bobule->[1];
    print chr(7) if $playfield[$new_x][$new_y] eq '!';
    gotoxy($bobule->[0]+1, $bobule->[1]+1);
    display $playfield[$bobule->[0]][$bobule->[1]];
    $bobule_at_cache[$bobule->[0]][$bobule->[1]] = 0;
    $bobule->[0] = $new_x;
    $bobule->[1] = $new_y;
    $bobule_at_cache[$bobule->[0]][$bobule->[1]] = 1;
    gotoxy($bobule->[0]+1, $bobule->[1]+1);
    display '.';
    $bobule->[2] = 1;
  }
  foreach $pole (@source)
  {
    if (not is_bobule_at($pole->[0], $pole->[1]) and rand(1) < .1)
    {
      push @bobule, [$pole->[0], $pole->[1], 1];
      $bobule_at_cache[$pole->[0]][$pole->[1]] = 1;
    }
  }
  foreach $pole (@sink)
  {
    if (is_bobule_at($pole->[0], $pole->[1]) and rand(1) < .1)
    {
      my $q = get_bobule_number_at($pole->[0], $pole->[1]);
      $bobule_at_cache[$pole->[0]][$pole->[1]] = 0;
      $bobule[$q] = $bobule[$#bobule]; pop @bobule;
    }
  }
  update_display();
  vsleep($delay / 1000);
}

### END ###
