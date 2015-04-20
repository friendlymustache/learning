class Link < ActiveRecord::Base
	has_many :link_edges
	has_many :topics, through: :link_edges
	
	# Validate uniqueness of url of link within each version of the site
	validates :url, :uniqueness => {:scope => :version,
		 :message => "Can only have one link with a given url per version"}
end
