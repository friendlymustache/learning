class CreateTopics < ActiveRecord::Migration
  def change
    create_table :topics do |t|
      t.string :name
      t.string :ancestry
      t.index :ancestry
      t.timestamps null: false
    end
  end
end
