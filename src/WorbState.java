/*
 * tc.catseye.worb.WorbState -- noit o'mnain worb for yoob
 */

/*
 * Copyright (c)2011 Cat's Eye Technologies.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 *   Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in
 *   the documentation and/or other materials provided with the
 *   distribution.
 *
 *   Neither the name of Cat's Eye Technologies nor the names of its
 *   contributors may be used to endorse or promote products derived
 *   from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * A tc.catseye.worb.WorbState implements the semantics of the
 * noit o'mnain worb automaton under the yoob framework.
 *
 * This class targets version 0.2 of the yoob framework's interface,
 * which isn't released yet, so knowing this doesn't help you much.
 */

package tc.catseye.worb;

import tc.catseye.yoob.Error;
import tc.catseye.yoob.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Random;
import java.util.Iterator;


class Worb implements Language {
    public String getName() {
        return "noit o' mnain worb";
    }

    public int numPlayfields() {
        return 1;
    }

    public int numTapes() {
        return 0;
    }

    public boolean hasProgramText() {
        return false;
    }

    public boolean hasInput() {
        return false;
    }

    public boolean hasOutput() {
        return false;
    }

    public List<String> exampleProgramNames() {
        ArrayList<String> names = new ArrayList<String>();
        names.add("freefill");
        names.add("magnetic field");
        names.add("theory of time");
        names.add("pressure");
        names.add("slow loop");
        names.add("fast loop");
        names.add("transistor");
        names.add("or gate");
        names.add("subtraction");
        names.add("division");
        return names;
    }

    public WorbState loadExampleProgram(int index) {
        String[][] program = {
          {
            /* eg/freefill.worb */
            "######################",
            "#                    #",
            "#                    #",
            "#                    #",
            "#                    #",
            "#                    #",
            "#         +          #",
            "#                    #",
            "#                    #",
            "#                    #",
            "#                    #",
            "######################",
          },
          {
            /* eg/magnetic-field.worb */
            "######################",
            "#                    #",
            "#                    #",
            "#                    #",
            "#                    #",
            "#         -          #",
            "#         +          #",
            "#                    #",
            "#                    #",
            "#                    #",
            "#                    #",
            "######################",
          },
          {
            /* eg/theory-of-time.worb */
            "######################",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "#..........          #",
            "######################",
          },
          {
            /* eg/pressure.worb */
            "#######################",
            "#..........>          #",
            "#######################",
          },
          {
            /* eg/slow-loop.worb */
            "#####################",
            "#        <          #",
            "# ################# #",
            "# #               # #",
            "# #               #.#",
            "# #               # #",
            "# ################# #",
            "#         >         #",
            "#####################",
          },
          {
            /* eg/fast-loop.worb */
            "#######",
            "# < < #",
            "# ### #",
            "# >.> #",
            "#######",
          },
          {
            /* eg/transistor.worb */
            "    ###",
            "### #+#",
            "#+# # #",
            "# ###v#",
            "#   < #",
            "### < #",
            "  # < #",
            "  ###v#",
            "    # #",
            "    #!#",
            "    #-#",
            "    ###",
            "",
          },
          {
            /* eg/or-gate.worb */
            "#####         #####",
            "#   ###########   #",
            "# . >         < . #",
            "#   #####v#####   #",
            "#####   #  ########",
            "        #       >!#",
            "        #v#########",
            "        # #",
            "        ###",
          },
          {
            /* eg/subtraction.worb */
            "###############",
            "#.............#",
            "#######v#######",
            "      #       #",
            "      #########",
            "",
          },
          {
            /* eg/division.worb */
            "############",
            "#..........#",
            "#######v####",
            "      #    #",
            "      #v####",
            "      #    #",
            "      #v####",
            "      #    #",
            "      #v####",
            "      #    #",
            "      ######",
          },
        };
        WorbState s = new WorbState();
        s.playfield.load(program[index]);
        return s;
    }

    public List<String> getAvailableOptionNames() {
        ArrayList<String> names = new ArrayList<String>();
        return names;
    }

    public WorbState importFromText(String text) {
        WorbState s = new WorbState();
        s.playfield.load(text.split("\\r?\\n"));
        return s;
    }
  
    private static final String[][] properties = {
        {"Author", "Chris Pressey"},
        {"Implementer", "Chris Pressey"},
        {"Implementation notes",
         "None yet."}
    };

    public String[][] getProperties() {
        return properties;
    }
}

class Bobule implements Element {
    int pressure;
    
    public Bobule() {
        pressure = 1;
    }

    public String getName() {
        if (pressure == 1)
            return ".";
        if (pressure >= 2 && pressure <= 3)
            return "o";
        if (pressure >= 4 && pressure <= 6)
            return "O";
        return "@";
    }

    public boolean equals(Element e) {
        return e instanceof Bobule; // a bobule is a bobule is a bobule!
    }

    public Bobule fromChar(char c) {
        return new Bobule();
    }
}

class WorbPlayfield extends BasicPlayfield<Element> {
    protected HashMap<Position, Bobule> bobuleMap;
    private Random rand;

    public WorbPlayfield() {
        super(new CharacterElement(' '));
        bobuleMap = new HashMap<Position, Bobule>();
        rand = new Random();
    }

    public WorbPlayfield clone() {
        WorbPlayfield c = new WorbPlayfield();
        c.copyBackingStoreFrom(this);
        c.bobuleMap = new HashMap<Position, Bobule>(
          (Map<Position, Bobule>)this.bobuleMap
        );
        return c;
    }

    public Element get(IntegerElement x, IntegerElement y) {
        Bobule bobule = bobuleMap.get(new Position(x, y));
        return (bobule == null) ? getBackground(x, y) : bobule;
    }

    public CharacterElement getBackground(IntegerElement x, IntegerElement y) {
        return (CharacterElement)super.get(x, y);
    }

    public void step() {
        Set<Position> bobulePositions = new HashSet<Position>(bobuleMap.keySet());
        Iterator<Position> it = bobulePositions.iterator();

        while (it.hasNext()) {
            Position p = it.next();
            Bobule b = bobuleMap.get(p);

            b.pressure++;
            IntegerElement new_x = p.getX().add(new IntegerElement(rand.nextInt(3) - 1));
            IntegerElement new_y = p.getY().add(new IntegerElement(rand.nextInt(3) - 1));
            Element e = get(new_x, new_y);
            if (e instanceof Bobule) {
                continue;
            } else if (e instanceof CharacterElement) {
                char c = ((CharacterElement)e).getChar();
                if (c == '#')
                    continue;
                if (c == '<' && p.getX().compareTo(new_x) < 0)
                    continue;
                if (c == '>' && p.getX().compareTo(new_x) > 0)
                    continue;
                if (c == '^' && p.getY().compareTo(new_y) < 0)
                    continue;
                if (c == 'v' && p.getY().compareTo(new_y) > 0)
                    continue;
                // print chr(7) if $playfield[$new_x][$new_y] eq '!';
            } else {
                // No other possibilities
            }
            bobuleMap.remove(p);
            b.pressure = 1;
            bobuleMap.put(new Position(new_x, new_y), b);
        }

        Iterator<Map.Entry<Position, Element>> cit = store.entrySet().iterator();
        while (cit.hasNext()) {
            Map.Entry<Position, Element> entry = cit.next();
            Position p = entry.getKey();
            char c = ((CharacterElement)entry.getValue()).getChar();
          
            if (c == '+') {
                Bobule b = bobuleMap.get(p);
                if (b == null && rand.nextInt(10) == 0) {
                    b = new Bobule();
                    bobuleMap.put(p, b);
                }
            } else if (c == '-') {
                Bobule b = bobuleMap.get(p);
                if (b != null && rand.nextInt(10) == 0) {
                    bobuleMap.remove(p);
                }
            }
        }
    }

    public void loadChar(int x, int y, char c) {
        if (c == '.') {
            bobuleMap.put(new Position(x, y), new Bobule());
        } else {
            set(x, y, new CharacterElement(c));
        }
    }

}

public class WorbState implements tc.catseye.yoob.State {
    protected WorbPlayfield playfield;
    protected BasicPlayfieldView view;
    private static final Worb language = new Worb();
    
    public WorbState() {
        playfield = new WorbPlayfield();
        view = new BasicPlayfieldView();
    }
    
    public WorbState clone() {
        WorbState c = new WorbState();
        c.playfield = this.playfield.clone();
        return c;
    }

    public Language getLanguage() {
	return language;
    }

    public List<Error> step(World world) {
        ArrayList<Error> errors = new ArrayList<Error>();      
        playfield.step();
        return errors;
    }

    public Playfield getPlayfield(int index) {
        return playfield;
    }

    public Tape getTape(int index) {
        return null;
    }

    public String getProgramText() {
        return "";
    }

    public int getProgramPosition() {
        return 0;
    }

    public List<Error> setProgramText(String text) {
        ArrayList<Error> errors = new ArrayList<Error>();
        return errors;
    }

    public View getPlayfieldView(int index) {
        return view;
    }

    public View getTapeView(int index) {
        return null;
    }

    public String exportToText() {
        return playfield.dump();
    }

    public void setOption(String name, boolean value) {
    }

    public boolean needsInput() {
        return false;
    }

    public boolean hasHalted() {
        return false;
    }
}
