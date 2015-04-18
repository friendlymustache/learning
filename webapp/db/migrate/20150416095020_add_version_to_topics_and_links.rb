class AddVersionToTopicsAndLinks < ActiveRecord::Migration
  def change
  	add_column :topics, :version, :integer, :default => 0
  	add_column :links, :version, :integer, :default => 0
  end
end
