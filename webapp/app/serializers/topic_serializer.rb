class TopicSerializer < ActiveModel::Serializer
  attributes :id, :name, :children, :parent
  embed :ids, embed_in_root: true
end
