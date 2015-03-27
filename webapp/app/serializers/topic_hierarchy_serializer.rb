class TopicHierarchySerializer < ActiveModel::Serializer
  attributes :id, :name, :parent_id

  has_many :links
  embed :ids, include: true, embed_in_root: true

end
