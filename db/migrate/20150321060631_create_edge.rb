class CreateEdge < ActiveRecord::Migration
  def change
    create_table :edges, id: false do |t|
    	t.integer :topic_id
    	t.integer :prereq_id
    	t.index :topic_id
    	t.index :prereq_id
    end
  end
end
