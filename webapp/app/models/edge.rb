class Edge < ActiveRecord::Base
	belongs_to :postreq, :foreign_key => "postreq_id",
	  :class_name => "Topic", autosave: true
	belongs_to :prereq, :foreign_key => "prereq_id",
	 :class_name => "Topic", autosave: true
end
