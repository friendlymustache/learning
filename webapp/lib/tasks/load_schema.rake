### Usage: rake db:load[version,sourcefile,delete_existing]


require 'json'
def delete_all(version)
	Topic.where("version = ?", version).each do |t|
 		t.destroy
 	end

 	Link.where("version = ?", version).each do |l|
 		l.destroy
 	end
end

def save_db_objects(source_path, version)

	file = File.read(source_path)
	database_objects = JSON.parse(file)

    puts "Got database objects, file: #{source_path}"

	topics = database_objects["topics"]
	links = database_objects["links"]

	# save topics
    puts "Saving topics..."
    if topics != nil
    	topics.each do |topic_hash|
            parent = Topic.find_by(:name => topic_hash["parent_name"], 
                :version => version)

            # Modify topic hash to include current version
            topic_hash["version"] = version
            topic_hash = topic_hash.slice(*(Topic.column_names))

            # puts "Hash: " + topic_hash.to_s
            if parent != nil
    		  parent.children.create(topic_hash)
            else
                Topic.create(topic_hash)
            end
    	end
    else
        puts "Warning: Topics list was empty!"
    end

    puts "Done saving topics, saving links..."

	# save links
    if links != nil
    	links.each do |link_hash|
    		parent_topic = Topic.find_by(:name => link_hash["parent_name"],
                :version => version)
            if parent_topic != nil
                link_hash = link_hash.slice(*(Link.column_names))
                link_hash["version"] = version
                # puts "Hash: " + link_hash.to_s
        		link = Link.create(link_hash)
        		parent_topic.links << link
            end
    	end
    else
        puts "Warning: Links list was empty!"        
    end

    puts "Done saving links."
end


namespace :db do 
  task :load, [:version, :sourcefile, :delete_existing] => [:environment] do |t, args|
     args.with_defaults(:delete_existing => false)
     args.with_defaults(:version => 0)
     args.with_defaults(:sourcefile => "links.json")

     # If a string was passed in for deleting the existing elements, 
     # delete them only if the string was "true"
     if args.delete_existing.is_a?(String)
     	args.delete_existing = (args.delete_existing == "true")
     end

     source_path = "datafiles/#{args.sourcefile}"

     puts "Version: #{args.version}, source: #{source_path}, " +
       "delete existing database entries: #{args.delete_existing}"

     if args.delete_existing == "true"
     	puts "Deleting all database entries for version #{args.version}"
     	delete_all(args.version)
     end

     puts "Loading topics and links from file #{source_path}"
     puts "Saving database objects as belonging to version #{args.version}"
     save_db_objects(source_path, args.version)


   end
end