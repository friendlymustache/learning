class AddTopicIdToLinks < ActiveRecord::Migration
  def change
  	add_column :links, :topic_id, :integer
  end
end
