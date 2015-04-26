class Edge < ActiveRecord::Base

	# Validate uniqueness of edge between a topic and a prereq
	validates :topic, :uniqueness => {:scope => :prereq,
		 :message => "Only one topic-prereq edge can exist between a pair of topics"}

	belongs_to :topic, autosave: true
	belongs_to :prereq, :foreign_key => "prereq_id",
	 :class_name => "Topic", autosave: true
end
