from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


class HelloWorldHandler(webapp.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write('HelloWorld!!')


def main():
  application = webapp.WSGIApplication([
    ('/helloworld', HelloWorldHandler), 
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
 