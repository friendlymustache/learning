# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

Rails.application.load_tasks


task :deploy do
  sh 'git checkout master'
  # sh 'git merge rails-served-html -m "Merging master for deployment"'
  sh 'rm -rf public/assets'
  sh 'cd public-src && BROCCOLI_ENV=production broccoli build ../backend/public/assets && cd ..'

  unless `git status` =~ /nothing to commit, working directory clean/
    sh 'git add -A'
    sh 'git commit -m "Asset compilation for deployment"'
  end

  sh 'git subtree push -P webapp heroku master'

  sh 'git checkout -'
end