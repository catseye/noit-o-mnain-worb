# Makefile for worb (yoob version).
# $Id$

JAVAC?=javac
JAVA?=java
JAR?=jar
PATHSEP?=:

JFLAGS?=-Xlint:deprecation -Xlint:unchecked
CDIR=bin/tc/catseye/worb
CLASSES=$(CDIR)/WorbState.class

YOOBDIR?=../yoob
CLASSPATH?=bin$(PATHSEP)$(YOOBDIR)/bin

all: $(CLASSES)

$(CDIR)/WorbState.class: src/WorbState.java
	$(JAVAC) $(JFLAGS) -cp "$(CLASSPATH)" -d bin src/WorbState.java

clean:
	rm -rf $(CDIR)/*.class

test: $(CLASSES)
	$(JAVA) -cp "$(CLASSPATH)" tc.catseye.yoob.GUI tc.catseye.worb.WorbState
