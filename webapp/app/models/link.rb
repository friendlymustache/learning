class Link < ActiveRecord::Base
	has_many :link_edges
	has_many :topics, through: :link_edges
end
