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
			render json: Topic.where("name ILIKE ?", "%#{params['name']}%")
		else
			render json: Topic.none
		end
	end
end
