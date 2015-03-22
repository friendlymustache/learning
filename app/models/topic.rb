class Topic < ActiveRecord::Base
	# Used to store hierarchy/nestedness of topics
	has_ancestry

	# Outgoing edges are those for which the current topic is a prereq
	has_many :outgoing_edges, :class_name => "Edge", :foreign_key => "prereq_id"
	# Incoming edges are those for which the current topic is a postreq
	has_many :incoming_edges, :class_name => "Edge", :foreign_key => "postreq_id"
	has_many :link_edges

	# Use edges as a join table to access prereq and postreq topics
	has_many :postreqs, through: :outgoing_edges
	has_many :prereqs, through: :incoming_edges

	# Use link_edges as a join table to access links
	has_many :links, through: :link_edges

	# Add the specified topic as a prereq of the current topic
	def add_prereq(topic)
		Edge.create({:prereq_id => topic.id, :postreq_id => self.id})
	end

	# Add the specified topic as a postreq of the current topic
	def add_postreq(topic)
		topic.add_prereq(self)
	end

end
