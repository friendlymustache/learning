class LandingController < ApplicationController

	def index
		puts "------ IN INDEX ACTION ----------"
		render text: "", layout: 'layouts/application.html.erb'		
	end

	def version_handler
		puts "------ IN VERSION HANDLER ----------"
		version = params[:version]
		render text: "", layout: "layouts/v#{version}.html.erb"
	end
end
