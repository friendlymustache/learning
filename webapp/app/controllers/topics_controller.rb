class TopicsController < ApplicationController
	
	def create
		@topic = Topic.new(params[:topic])
		if @topic.save
			redirect_to 'index'
		else
			render json: {:error => "Failed to create topic"}
		end
	end

	def show
		render json: Topic.find_by_name(params[:id])
	end

	def index
		if params['name'] != nil
			render json: Topic.where("name ILIKE ? AND ancestry IS NULL",
			 "%#{params[:name]}%")
		else
			render json: Topic.all
		end
	end

end
