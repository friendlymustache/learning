class LinkEdge < ActiveRecord::Base
	belongs_to :link, autosave: true
	belongs_to :topic, autosave: true
end
