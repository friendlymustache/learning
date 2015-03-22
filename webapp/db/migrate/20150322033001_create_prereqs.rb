class CreatePrereqs < ActiveRecord::Migration
  def change
    create_table :prereqs do |t|

      t.timestamps null: false
    end
  end
end
