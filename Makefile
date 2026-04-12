# Local Hugo dev. Requires: Hugo Extended (CI uses 0.145.x; newer is fine).
#   make serve          → http://localhost:1313/
#   make serve-pages    → same layout as github.io/.../Telltale/ (subpath)
#   make build          → production output in public/

HUGO       ?= hugo
PUBLIC_URL ?= https://cdsap.github.io/Telltale/

.PHONY: setup serve serve-pages build clean

setup:
	git submodule update --init --recursive

serve: setup
	$(HUGO) server -D

# Mirrors project-site URL (assets/links under /Telltale/).
serve-pages: setup
	$(HUGO) server -D --baseURL "http://localhost:1313/Telltale/"

# Same idea as .github/workflows/hugo-gh-pages.yml (set PUBLIC_URL to match your Pages URL).
build: setup
	HUGO_ENV=production HUGO_ENVIRONMENT=production $(HUGO) --gc --minify --baseURL "$(PUBLIC_URL)"

clean:
	rm -rf public resources
