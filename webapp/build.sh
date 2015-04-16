#!/bin/bash
# Based on https://github.com/knomedia/ember-cli-rails/blob/master/build.sh
 

 # Usage: build.sh <environment> <clear_assets> <root_url>
 # The build script prepends a forward slash to the root_url, so don't worry about
 # that.

 # Note: Semantic-UI has been custom-configured so that the CSS references
 # references a sibling "themes" folder (../themes/default/...) for getting
 # icon images.

# for (( i = 0; i < 17; i++ )); do echo "$(tput setaf $i)This is ($i) $(tput sgr0)"; done
 
function printMessage {
  color=$(tput setaf $1)
  message=$2
  reset=$(tput sgr0)
  echo -e "${color}${message}${reset}"
}
 
function boldMessage {
  color=$(tput setaf $1)
  message=$2
  reset=$(tput sgr0)
  echo -e "${color}*************************************${reset}"
  echo -e "${color}${message}${reset}"
  echo -e "${color}*************************************${reset}"
}
 
build_env="$1"
clear_assets="$2"
root_url="$3"

# Determine whether or not to clear assets folder (default is to not remove
# assets)  
if [ "$clear_assets" != "true" ]
  then
    clear_assets="false"
fi

# Set build environment to default if needed
if [ "$build_env" != "development" ]
  then
    build_env="production"
fi    

# Set up layout file for the current version based on the root_url
if [ "$root_url" != "" ]
  then
    target_file="app/views/layouts/$root_url.html.erb"
  else
    target_file="app/views/layouts/application.html.erb"
    root_url="root"
fi   

# Prepend a forward slash to the root_url
root_url="/$root_url"

# Set the baseURL attribute to root_url into environment.js
sed -i s#baseURL:.*#baseURL:\'$root_url\',# public-src/config/environment.js

echo "Building Ember App environment $build_env, clear assets: $clear_assets, baseURL: $root_url"

# Remove assets folder if necessary
if [ "$clear_assets" = "true" ]  
  then
  printMessage 4 "Deleting existing public/ember-assets folder"
  rm -rf public/ember-assets
fi  

# Run the build commmand
cd public-src
ember build --environment $build_env
cd ../

# Copy over the build results to the Rails public folder
printMessage 3 "Copying ember build files to rails"
cp -r public-src/dist/* public/

# Move the public/assets folder to public/ember-assets/root_url
printMessage 3 "Swapping assets dir for ember-assets$root_url"
rm -rf public/ember-assets$root_url
mkdir -p public/ember-assets$root_url
cp -r public/assets/* public/ember-assets$root_url && rm -r public/assets/
# mv -f public/assets/* public/ember-assets

# Replace all stylesheet/script links to "assets/..." with "ember-assets/root_url/..."
printMessage 3 "Replacing references to 'assets' with 'ember-assets"$root_url"' in public/index.html"
sed -i s#assets#ember-assets$root_url# public/index.html

# Replace the target layout file's contents with the result of
# the ember build command.
printMessage 4 "Replacing $target_file's contents with index.html"
cp public/index.html $target_file
rm -f public/index.html

# Insert ERB tags into the new layout file for Rails's sake
printMessage 4 "inserting csrf_meta_tags in head"
sed -i 's/<\/head>/<%= csrf_meta_tags %>&/' $target_file
 
printMessage 4 "inserting yield in body"
sed -i 's/<body>/&<%= yield %>/' $target_file

# Update references to themes folder
printMessage 4 "Inserting references to global themes folder in CSS"
sed -i s#themes#../themes#g public/ember-assets$root_url/*.css

printMessage 4 "Removing version-specific themes folder"
rm -rf public/ember-assets$root_url/themes

# Delete tempfiles/backups
printMessage 4 "Cleaning Up"
rm -rf public_bk/
rm public/index.html
 
boldMessage 4 "Done"