SASS=../../node_modules/.bin/sass
CSS_TARGETS=$(patsubst %.scss,%.css,$(wildcard *.scss))

bundle: $(CSS_TARGETS)
	cat *.css > bundle.css

css: $(CSS_TARGETS)

clean:
	rm -f *.css

%.css: %.scss
	$(SASS) $? >$@

.PHONY: bundle clean css