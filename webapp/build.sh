#!/bin/bash
# Based on https://github.com/knomedia/ember-cli-rails/blob/master/build.sh
 

 # Usage: build.sh <environment> <clear_assets> <version>

 # Note: Semantic-UI has been custom-configured so that the CSS references
 # references a sibling "themes" folder (../themes/default/...) for getting
 # icon images.

 # This script works by managing the following:
 # baseURL : A (currently) irrelevant variable that's used internally
 #           by Ember to keep track of the URL on which the Ember app is being
 #           served.
 # namespace: The API endpoint to which Ember requests should bem ade
 #
 # After setting up the ember configuration variables, the script
 # runs the build command, moves the built Ember app (represented as
 # two vendor-*.js and two vendor-*.css files)
 # to the Rails public folder, and injects appropriate references to
 # the Ember app scripts into Rails HTML files.
 
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

# The file path component used to describe this version in the Rails
# project
version_path="v$3"

# The actual version value
version="$3"

###############################
## Parse command-line arguments 
###############################

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

# Set up layout file for the current version based on the version_path
if [ "$version" != "" ]
  then
    target_file="app/views/layouts/$version_path.html.erb"
  else
    # The default file is application.html.erb    
    target_file="app/views/layouts/application.html.erb"
    # Store default assets in a <root> subdirectory
    # rather than using nothing for their file path.
    version_path="root"
    # Default version for topics/links is 0
    version=0
fi   

# Prepend a forward slash to the version_path
version_path="/$version_path"


##################################################################
## Set environment.js variables, remove assets folder if necessary 
##################################################################

# Set the baseURL attribute to version_path into environment.js
sed -i s#baseURL:.*#baseURL:\'$version_path\',# public-src/config/environment.js

# Set the namespace attribute (the base URL for API requests)
sed -i s#namespace:.*#namespace:\'v/$version\',# public-src/config/environment.js

# Remove assets folder if necessary
if [ "$clear_assets" = "true" ]  
  then
  printMessage 4 "Deleting existing public/ember-assets folder"
  rm -rf public/ember-assets
fi  

#########################
## Run the build commmand 
#########################
echo "Building Ember App environment $build_env, clear assets: $clear_assets, baseURL: $version_path"
echo "Proxying API requests to url: <host>/v/$version"

cd public-src
ember build --environment $build_env
cd ../

############################################
## Move build results to appropriate folders
############################################

# Copy over the build results to the Rails public folder
printMessage 3 "Copying ember build files to rails"
cp -r public-src/dist/* public/

# Move the public/assets folder to public/ember-assets/version_path
printMessage 3 "Swapping assets dir for ember-assets$version_path"
rm -rf public/ember-assets$version_path
mkdir -p public/ember-assets$version_path
cp -r public/assets/* public/ember-assets$version_path && rm -r public/assets/
# mv -f public/assets/* public/ember-assets

####################################################
## Modify files to reference appropriate build files
####################################################

# Replace all stylesheet/script links to "assets/..." with "/ember-assets/version_path/..."
printMessage 3 "Replacing references to 'assets' with '/ember-assets"$version_path"' in public/index.html"
sed -i s#assets#/ember-assets$version_path# public/index.html

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
sed -i s#themes#../themes#g public/ember-assets$version_path/*.css

printMessage 4 "Removing version-specific themes folder"
rm -rf public/ember-assets$version_path/themes

# Delete tempfiles/backups
printMessage 4 "Cleaning Up"
rm -rf public_bk/
rm public/index.html
 
boldMessage 4 "Done"