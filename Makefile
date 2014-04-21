# GNU Makefile for worb (yoob version).
# $Id$

JAVAC?=javac
JAVA?=java
JAR?=jar
ifeq ($(OS),Windows_NT)
  PATHSEP=;
else
  PATHSEP=:
endif

JFLAGS?=-Xlint:deprecation -Xlint:unchecked
CDIR=bin/tc/catseye/worb
CLASSES=$(CDIR)/WorbState.class

YOOBDIR?=../yoob
CP?=bin$(PATHSEP)$(YOOBDIR)/bin

all:
	@echo "Java classes are not built by default.  Run 'make java' to build them."

java: $(CLASSES)

$(CDIR)/WorbState.class: src/WorbState.java
	$(JAVAC) $(JFLAGS) -cp "$(CP)" -d bin src/WorbState.java

clean:
	rm -rf $(CDIR)/*.class

test: $(CLASSES)
	$(JAVA) -cp "$(CP)" tc.catseye.yoob.GUI tc.catseye.worb.WorbState
