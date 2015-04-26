class LinkEdge < ActiveRecord::Base
	belongs_to :link, autosave: true
	belongs_to :topic, autosave: true

	# Validate uniqueness of edge between a topic and a prereq
	validates :link, :uniqueness => {:scope => :topic,
		 :message => "Only one edge can exist between a given link and a topic"}	
end
