class TopicSerializer < ActiveModel::Serializer
  attributes :id, :name, :parent_id

  # has_many :incoming_edges
	has_many :edges
	has_many :topics

  # has_many :prereqs
  # has_many :postreqs

  def topics
  	object.prereqs
  end


  has_many :links
  embed :ids, include: true, embed_in_root: true

end
