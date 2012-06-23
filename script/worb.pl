#/usr/local/bin/perl -w

# noit o' mnain worb - fungeoid language based on brownian motion
# v1.1 Jul 19 2000 Chris Pressey, Cat's Eye Technologies

# Copyright (c)2000, Cat's Eye Technologies.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
# 
#   Redistributions of source code must retain the above copyright
#   notice, this list of conditions and the following disclaimer.
# 
#   Redistributions in binary form must reproduce the above copyright
#   notice, this list of conditions and the following disclaimer in
#   the documentation and/or other materials provided with the
#   distribution.
# 
#   Neither the name of Cat's Eye Technologies nor the names of its
#   contributors may be used to endorse or promote products derived
#   from this software without specific prior written permission. 
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
# CONTRIBUTORS ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
# INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
# OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
# PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
# OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
# OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE. 

# usage: [perl] worb[.pl] worb-playfield-file
# requirements: ANSI terminal emulation, for animation.

# history: v1.0 Jul  5 2000 - original release.
#          v1.1 Jul 19 2000 - changed + and -
#                             optimized display routine for ANSI
#                             optimized is_bobule_at (cached)
#                             relicensed & released on web site

### GLOBALS ###

@bobule = ();
@source = ();
@sink = ();
@playfield = ();

@bobule_at_cache = ();

$x = 0; $y = 0;

### SUBS ###

sub draw_playfield
{
  printf "%c[1;1H", 27;  # gotoxy 1,1
  my $i; my $j; my $p;
  for($j = 0; $j <= $maxy; $j++)
  {
    for($i = 0; $i <= $maxx; $i++)
    {
      if ($p = is_bobule_at($i,$j))
      {
        if ($p == 1) { print '.'; }
        elsif ($p >= 2 and $p <= 3) { print 'o'; }
        elsif ($p >= 4 and $p <= 6) { print 'O'; }
        elsif ($p >= 7 and $p <= 10) { print '0'; }
        else { print '@'; }
      } else
      {
        print $playfield[$i][$j];
      }
    }
    print "\n";
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

printf "%c[2J", 27;  # clear screen

draw_playfield();

$start_time = time();
$tick = 1;
while(1)
{
  my $bobule; my $pole;
  foreach $bobule (@bobule)
  {
    $bobule->[2]++;
    if ($bobule->[2] == 2 or $bobule->[2] == 4 or $bobule->[2] == 7 or $bobule->[2] == 11)
    {
      my $p = $bobule->[2];
      printf "%c[%d;%dH", 27, $bobule->[1]+1, $bobule->[0]+1;
      if ($p == 2) { print 'o'; }
      elsif ($p == 4) { print 'O'; }
      elsif ($p == 7) { print '0'; }
      elsif ($p == 11) { print '@'; }
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
      printf "%c[%d;%dH%s", 27, $bobule->[1]+1, $bobule->[0]+1,
        $playfield[$bobule->[0]][$bobule->[1]];
    $bobule_at_cache[$bobule->[0]][$bobule->[1]] = 0;
    $bobule->[0] = $new_x;
    $bobule->[1] = $new_y;
    $bobule_at_cache[$bobule->[0]][$bobule->[1]] = 1;
    printf "%c[%d;%dH.", 27, $bobule->[1]+1, $bobule->[0]+1;
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
  # track_time();
}

sub track_time
{
  $tick++;
  if ($tick > 1000)
  {
    $total_time = time() - $start_time;
    $fps = int(1000 / $total_time);
    die "Total time: $total_time seconds, approx fps: $fps\n";
  }
}

### END ###
