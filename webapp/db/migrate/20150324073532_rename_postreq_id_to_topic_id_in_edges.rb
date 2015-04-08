class RenamePostreqIdToTopicIdInEdges < ActiveRecord::Migration
  def change
  	rename_column :edges, :postreq_id, :topic_id
  end
end
