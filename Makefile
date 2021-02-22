
.PHONY: bundle scss

all: bundle.js scss

bundle.js: $(wildcard static/js/*.es6 static/js/**/*.es6)
	node esbuild.js

scss:
	$(MAKE) -C static/scss bundle.css

install:
	@test $(INSTALL_PATH) || ( echo "INSTALL_PATH is not set"; exit 1 )
	@test -d $(INSTALL_PATH) || ( echo "$(INSTALL_PATH) is not a directory"; exit 1 )

	rsync -u bundle.js "$(INSTALL_PATH)/bundle.js"
	rsync -u standalone.html "$(INSTALL_PATH)/index.html"
	mkdir -p "$(INSTALL_PATH)/static/scss"
	rsync -u static/scss/bundle.css "$(INSTALL_PATH)/static/scss/bundle.css"
	rsync -u -r static/img "$(INSTALL_PATH)/static/img"
	rsync -u -r static/svg "$(INSTALL_PATH)/static/svg"
	rsync -u -r static/soundfonts "$(INSTALL_PATH)/static/soundfonts"
