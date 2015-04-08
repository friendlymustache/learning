class TopicPrereqGraphSerializer < ActiveModel::Serializer
  attributes :id, :name

 	# Include these has_many associations so that the serializer
 	# includes a list of edge_ids and topic_ids (the IDs of its
 	# prereqs) for each topic

	# has_many :children
	has_many :edges
	has_many :topics
  
  def topics
  	object.prereqs
  end


  has_many :links
  embed :ids, include: true, embed_in_root: true
end
