class AddIdToEdges < ActiveRecord::Migration
  def change
  	add_column :edges, :id, :primary_key
  end
end
