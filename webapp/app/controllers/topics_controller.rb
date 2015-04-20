class TopicsController < ApplicationController
	skip_before_action :verify_authenticity_token, :only => [:create]
	def create
		'''
		Accepts parameters containing values for any/all topic columns and 
		a "parent_name" parameter. Creates a new topic under the parent with
		the specified name
		'''

		parent = Topic.find_by_name(topic_params[:parent_name])
		topic_hash = topic_params.slice(*(Topic.column_names))

		# Add version to link_hash
		topic_hash["version"] = topic_params["v_id"]

		if parent != nil
			@topic = parent.children.new(topic_hash)
		else
			@topic = Topic.new(topic_hash)
		end

		if @topic.save
			render json: {:success => true}
		else
			error_message = "Failed to create topic with attributes " + params.to_s
		 	render json: {:error => error_message}		
		end
	end


	# TODO fix the route for this action so that the param
	# isn't misleadingly called 'id' when it's actualy the topic name
	def show
		paramValue = params[:id]
		# If we're searching by name, use the hierarchy serializer
		if paramValue.to_i == 0
			render json: Topic.find_by_name(params[:id]), serializer: TopicHierarchySerializer, root: "topic"
		# If we're searching by ID, use the topic serializer (default)
		else
			render json: Topic.find(paramValue.to_i)
		end
	end

	def index
		# If a query string was provided, return all the topics 
		# whose names contain the query string and all of their
		# prereqs, along with the children of each of these topics.
		if params['name'] != nil
			render json: Topic.get_subgraph(params['name'], params['v_id']), 
 			  each_serializer: TopicPrereqGraphSerializer

		# Use this endpoint without any name parameter as a
		# means of getting a JSON dump of all topics in development,
		# but return nothing in production.
		elsif Rails.env == "development"
			render json: Topic.all, each_serializer: TopicPrereqGraphSerializer
		else
			render json: Topic.none
		end
	end

private

  def topic_params
    params.permit!
  end

end
