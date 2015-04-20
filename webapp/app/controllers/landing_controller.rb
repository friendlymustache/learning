class LandingController < ApplicationController

	def index
		render text: "", layout: 'layouts/application.html.erb'		
	end

	def version_handler
		version = params[:version]
		render text: "", layout: "layouts/v#{version}.html.erb"
	end
end
