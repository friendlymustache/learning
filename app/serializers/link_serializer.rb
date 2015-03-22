class LinkSerializer < ActiveModel::Serializer
  attributes :id, :url
  embed :ids, include: true, embed_in_root: true
end
