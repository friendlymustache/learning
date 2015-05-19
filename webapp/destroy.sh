# Usage: destroy.sh version

version="$1"

if [ version != "" ]
	then
	# Destroy compiled Ember assets for the specified version
	rm -rf public/ember-assets/$version

	# Destroy layout file for the specified version
	rm app/views/layouts/$version.html.erb
fi