class EdgeSerializer < ActiveModel::Serializer
  attributes :prereq_id, :topic_id, :id
  embed :ids, include: true, embed_in_root: true
end
