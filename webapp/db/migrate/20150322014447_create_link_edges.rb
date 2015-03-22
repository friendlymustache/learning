class CreateLinkEdges < ActiveRecord::Migration
  def change
    create_table :link_edges, id: false do |t|
      t.integer :topic_id
      t.integer :link_id    	
      t.timestamps null: false
    end
  end
end
