class TopicSerializer < ActiveModel::Serializer
  attributes :id, :name, :child_ids
  has_one :parent, key: :parent_id  
  embed :ids, include: true, embed_in_root: true
end
