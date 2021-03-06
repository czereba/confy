require 'google/apis/calendar_v3'
require 'google/apis/oauth2_v2'
require 'google/api_client/client_secrets'

include Rails.application.routes.url_helpers

class GoogleOauth
  CLIENT_SECRETS = Google::APIClient::ClientSecrets.new(
    YAML.load(ERB.new(File.read(Rails.root.join('config/google_secret.yml'))).result)[Rails.env]
  )

  class << self
    def authenticated?(credentials = {})
      return false unless credentials.is_a?(Hash)
      credentials.key?('client_id') && credentials.key?('client_secret')
    end

    def refresh_token(credentials = {})
      auth_client = Signet::OAuth2::Client.new(JSON.parse(credentials))
      auth_client.fetch_access_token!
      auth_client.to_json
    end

    def need_to_refresh_token?(credentials = {})
      auth_client = Signet::OAuth2::Client.new(JSON.parse(credentials))
      auth_client.refresh_token && auth_client.expired?
    end

    def default_client
      CLIENT_SECRETS.to_authorization.tap do |auth_client|
        auth_client.update!(
          scope: %w(https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email),
          redirect_uri: (url_for action: :authenticate, controller: :authentication, host: ENV['HOSTNAME'])
        )
      end
    end

    def request_code_uri
      default_client.authorization_uri.to_s
    end

    def get_user_credentials(code)
      default_client.tap do |auth_client|
        auth_client.code = code
        auth_client.fetch_access_token!
      end.to_json
    end

    def user_email(credentials)
      service = user_info_service(credentials)
      service.get_userinfo.email
    end

    def user_info_service(credentials)
      Google::Apis::Oauth2V2::Oauth2Service.new.tap { |s| s.authorization = service_client(credentials) }
    end

    def service_client(credentials)
      Signet::OAuth2::Client.new(JSON.parse(credentials))
    end
  end

  private_class_method :user_info_service, :service_client
end
