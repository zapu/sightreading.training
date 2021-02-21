
.PHONY: bundle scss

all: bundle.js scss

bundle.js: $(wildcard static/js/*.es6 static/js/**/*.es6)
	node esbuild.js

scss:
	$(MAKE) -C static/scss bundle.css

install:
	@test $(INSTALL_PATH) || ( echo "INSTALL_PATH is not set"; exit 1 )
	@test -d $(INSTALL_PATH) || ( echo "$(INSTALL_PATH) is not a directory"; exit 1 )

	cp bundle.js "$(INSTALL_PATH)/"
	cp standalone.html "$(INSTALL_PATH)/index.html"
	mkdir -p "$(INSTALL_PATH)/static/scss"
	cp static/scss/bundle.css "$(INSTALL_PATH)/static/scss/bundle.css"
	cp -r static/img "$(INSTALL_PATH)/static/img"
	cp -r static/svg "$(INSTALL_PATH)/static/svg"
	cp -r static/soundfonts "$(INSTALL_PATH)/static/soundfonts"
