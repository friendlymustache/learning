# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

root = Topic.create(name: 'Algorithms')
root.children.create([{name: 'Mathematical Foundations'}, {name: 'Dynamic Programming'}, {name: 'Greedy Algorithms'}])

algebra = Topic.create(name: 'Algebra')
addition = Topic.create(name: 'Addition')
algebra.add_prereq(addition)