class Topic < ActiveRecord::Base
	# Used to store hierarchy/nestedness of topics
	has_ancestry

	# Validate uniqueness of name of topic within each version of the site
	validates :name, :uniqueness => {:scope => :version,
		 :message => "Can only have one topic with a given name per version"}

	# Outgoing edges are those for which the current topic is a prereq
	has_many :outgoing_edges, :class_name => "Edge", :foreign_key => "prereq_id"
	# Incoming edges are those for which the current topic is a postreq
	# has_many :incoming_edges, :class_name => "Edge", :foreign_key => "postreq_id"
	has_many :edges, dependent: :destroy

	# Use edges as a join table to access prereq and postreq topics
	has_many :postreqs, through: :outgoing_edges
	has_many :prereqs, through: :edges

	# Edges connecting topics and links
	has_many :link_edges
	# Use link_edges as a join table to access links
	has_many :links, through: :link_edges

	# Add the specified topic as a prereq of the current topic
	def add_prereq(topic)
		Edge.create({:prereq_id => topic.id, :topic_id => self.id})
	end

	# Add the specified topic as a postreq of the current topic
	def add_postreq(topic)
		topic.add_prereq(self)
	end

	# Finds the topic with the specified name (returns an empty
	# list if no such topic exists) and a list consisting of
	# the topic and its immediate children.
	def self.get_tree(name)
		root = Topic.find_by_name(name)
		if root != nil
			return [root] + root.children
		else
			return []
		end
	end


	# Get a list (without duplicates) 
	# of all topics with names containing the substring <raw_query>
	# and all of their prereqs.
	def self.get_subgraph(raw_query, raw_version)
		# Add % signs as wildcards for pattern matching (so that
		# we match any topics whose names contain <raw_query>)
		raw_query = "%" + raw_query + "%"
		
		query = Topic.sanitize(raw_query)
		version = Topic.sanitize(raw_version)

		where_predicate = "name ILIKE #{query} AND ancestry IS " +
		  "NULL AND version = #{version}"

		safe_sql = """
		SELECT *
		 FROM topics
		 WHERE #{where_predicate}

		UNION 

		SELECT * 
		FROM 
		    (SELECT DISTINCT prereq_id AS id 
		     FROM topics JOIN edges ON topics.id = edges.topic_id
		     WHERE #{where_predicate}) as prereq_ids
		    NATURAL JOIN 
		    (SELECT * FROM topics) as topic_ids;

		""".gsub("\n", "")

		return Topic.find_by_sql(safe_sql)
	end

end
