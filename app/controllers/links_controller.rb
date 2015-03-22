class LinksController < ApplicationController

	def create
		@link = Link.new(params[:link])
		if @link.save
			redirect_to 'index'
		else
			render json: {:error => "Failed to create link"}
		end
	end

	def index
		render json: Link.all
	end

end
