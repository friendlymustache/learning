class Topic < ActiveRecord::Base
	has_ancestry
	has_and_belongs_to_many :topics,
	 :join_table => 'Edge',
	 :foreign_key => :topic_id,
	 :association_foreign_key => :prereq_id
end
