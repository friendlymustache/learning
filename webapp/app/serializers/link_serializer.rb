class LinkSerializer < ActiveModel::Serializer
  attributes :id, :url, :title
  has_many :topics
  embed :ids, include: true, embed_in_root: true
end
