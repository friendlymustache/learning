class RenameTopicIdToPostreqIdInEdges < ActiveRecord::Migration
  def change
  	rename_column :edges, :topic_id, :postreq_id
  end
end
