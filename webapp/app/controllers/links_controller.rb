class LinksController < ApplicationController
	skip_before_action :verify_authenticity_token, :only => [:create]
	def create
		'''
		Accepts parameters containing values for any/all link columns and 
		a "parent_name" parameter. Creates a new link under the parent with
		the specified name
		'''

		parent = Topic.find_by_name(link_params[:parent_name])
		if parent != nil 
			link_hash = link_params.slice(*(Link.column_names))
			# Add version to link_hash
			link_hash["version"] = link_params["v_id"]
			@link = Link.new(link_hash)
			if @link.save
				@link.topics << parent
				parent.links << @link
				render json: {:success => true}
			else
			 	render json: {:error => "Failed to create link with " +
			 		"attributes " + link_params.to_s}	
			end
		else
			error_message = "Link " + link_params.to_s + " must be created under a parent topic"
			render json: {:error => error_message}
		end
	end


	def index
		render json: Link.all
	end

private

  def link_params
    params.permit!
  end

end
