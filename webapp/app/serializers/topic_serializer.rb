class TopicSerializer < ActiveModel::Serializer
  attributes :id, :name, :child_ids
  has_one :parent, key: :parent_id  
  has_many :links
  embed :ids, include: true, embed_in_root: true
end
