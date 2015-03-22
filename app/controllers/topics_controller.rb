class TopicsController < ApplicationController
	
	def create
		@topic = Topic.new(params[:topic])
		if @topic.save
			redirect_to 'index'
		else
			render json: {:error => "Failed to create topic"}
		end
	end

	def index
		if params['name'] != nil
			# Use limit field to specify whether we want one or many records in response
			if params['limit'] != nil
				render json: Topic.find_by_name(params['name'])
			else
				render json: Topic.where("name ILIKE ?", "%#{params['name']}%")
			end

		else
			render json: Topic.all
		end
	end

end
