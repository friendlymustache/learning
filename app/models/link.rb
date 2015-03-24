class Link < ActiveRecord::Base
	has_many :topics, through: :link_edges
end
