# Used to serialize the current topic being viewed in the hierarchy
class TopicHierarchySerializer < ActiveModel::Serializer
  attributes :id, :name
  has_many :links
  has_one :parent, key: :parent_id
  has_many :children, key: :child_ids

  
  # Rename "parents" to "topics" in JSON output so that ember can recognize it
  # has_one :topic

  # Rename children to "topics" in JSON output
  """
  has_many :topics

  def topics
  	output = object.children
  	if object.parent != nil
  		output << object.parent
  	end
  	return output
  end
  """

  embed :ids, include: true, embed_in_root: true

end
