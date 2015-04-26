require 'json'
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

algebra = Topic.create(name: 'Algebra')
addition = Topic.create(name: 'Addition')
algebra.add_prereq(addition)

algorithms = Topic.create(name: 'Algorithms')

topic_list = [
    {
        "name" => "Foundations",
        "parent" => "Algorithms"
    },
    {
        "name" => "The Role of Algorithms in Computing",
        "parent" => "Foundations"
    },
    {
        "name" => "Getting Started",
        "parent" => "Foundations"
    },
    {
        "name" => "Growth of Functions",
        "parent" => "Foundations"
    },
    {
        "name" => "Recurrences",
        "parent" => "Foundations"
    },
    {
        "name" => "Probabilistic Analysis and Randomized Algorithms",
        "parent" => "Foundations"
    },
    {
        "name" => "Sorting and Order Statistics",
        "parent" => "Algorithms"
    },
    {
        "name" => "Heapsort",
        "parent" => "Sorting and Order Statistics"
    },
    {
        "name" => "Quicksort",
        "parent" => "Sorting and Order Statistics"
    },
    {
        "name" => "Sorting in Linear Time",
        "parent" => "Sorting and Order Statistics"
    },
    {
        "name" => "Medians and Order Statistics",
        "parent" => "Sorting and Order Statistics"
    },
    {
        "name" => "Data Structures",
        "parent" => "Algorithms"
    },
    {
        "name" => "Elementary Data Structures",
        "parent" => "Data Structures"
    },
    {
        "name" => "Hash Table",
        "parent" => "Data Structures"
    },
    {
        "name" => "Binary Search Trees",
        "parent" => "Data Structures"
    },
    {
        "name" => "Red-Black Trees",
        "parent" => "Data Structures"
    },
    {
        "name" => "Augmenting Data Structures",
        "parent" => "Data Structures"
    },
    {
        "name" => "Advanced Design and Analysis Techniques",
        "parent" => "Algorithms"
    },
    {
        "name" => "Dynamic Programming",
        "parent" => "Advanced Design and Analysis Techniques"
    },
    {
        "name" => "Greedy Algorithms",
        "parent" => "Advanced Design and Analysis Techniques"
    },
    {
        "name" => "Amortized Analysis",
        "parent" => "Advanced Design and Analysis Techniques"
    },
    {
        "name" => "Advanced Data Structures",
        "parent" => "Algorithms"
    },
    {
        "name" => "B-Trees",
        "parent" => "Advanced Data Structures"
    },
    {
        "name" => "Binomial Heaps",
        "parent" => "Advanced Data Structures"
    },
    {
        "name" => "Fibonacci Heaps",
        "parent" => "Advanced Data Structures"
    },
    {
        "name" => "Data Structures for Disjoint Sets",
        "parent" => "Advanced Data Structures"
    },
    {
        "name" => "Graph Algorithms",
        "parent" => "Algorithms"
    },
    {
        "name" => "Elementary Graph Algorithms",
        "parent" => "Graph Algorithms"
    },
    {
        "name" => "Minimum Spanning Trees",
        "parent" => "Graph Algorithms"
    },
    {
        "name" => "Single-Source Shortest Paths",
        "parent" => "Graph Algorithms"
    },
    {
        "name" => "All-Pairs Shortest Paths",
        "parent" => "Graph Algorithms"
    },
    {
        "name" => "Maximum Flow",
        "parent" => "Graph Algorithms"
    },
    {
        "name" => "Selected Topics",
        "parent" => "Algorithms"
    },
    {
        "name" => "Sorting Networks",
        "parent" => "Selected Topics"
    },
    {
        "name" => "Matrix Operations",
        "parent" => "Selected Topics"
    },
    {
        "name" => "Linear Programming",
        "parent" => "Selected Topics"
    },
    {
        "name" => "Polynomials and the FFT",
        "parent" => "Selected Topics"
    },
    {
        "name" => "Number-Theoretic Algorithms",
        "parent" => "Selected Topics"
    },
    {
        "name" => "String Matching",
        "parent" => "Selected Topics"
    },
    {
        "name" => "Computational Geometry",
        "parent" => "Selected Topics"
    }
]


def buildScrapingCommand(name)
    return "python ../scraping/KhanScraper.py #{name}"
end

def create_links
    '''
    puts "Getting links for topic: #{topic.name}"
    command = buildScrapingCommand(topic.name)
    result = JSON.parse(`#{command}`)
    for link in result
        topic.links.create({title: link["name"], url: link["url"]})
    end
    '''

    source_path = "datafiles/links.json"
    file = File.read(source_path)
    links = JSON.parse(file)["links"]
    puts "Creating #{links.length} links"
    links.each do |link_hash|
        topic_ids = link_hash["topic_ids"]
        link_hash = link_hash.slice(*(Link.column_names))
        link = Link.find_by_url(link_hash["url"])
        if not link 
            link = Link.create(link_hash)
        else
            puts "Not creating redundant link with url #{link_hash['url']}"
        end

        topic_ids.each do |t_id|
            parent = Topic.find(t_id.to_i)        
            parent.links << link
        end
    end

end

# Create all topics
for topic_hash in topic_list
  name = topic_hash["name"]
  parent_name = topic_hash["parent"]
  parent = Topic.find_by_name(parent_name)
  if parent != nil
  	topic = parent.children.create({name: name})
  end
end	

# Create links
create_links

