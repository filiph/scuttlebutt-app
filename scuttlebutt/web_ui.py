from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

from news_topic import NewsTopic

import logging

simple_html_template = """
<!doctype html>
<html>
	<head>
		<title>%(title)s :: Scuttlebutt</title>
	</head>
	<body>
		<h1><a href="/admin/">Scuttlebutt</a> :: %(title)s</h1>
		<p>%(description)s</p>
		<div id='content'>
			%(content)s
		</div>
	</body>
</html>
"""

class MainPage(webapp.RequestHandler):
	def get(self):
		content = "<table>"
		for page in ui_pages:
			content += "<tr><td><a href='%(url)s'>%(url)s</a></td></tr>" % {'url' : page[0]}
		content += "</table>"
		
		self.response.headers['Content-Type'] = 'text/html'
		self.response.out.write(simple_html_template % {
							'title' : "Main Admin Page",
							'description' : "This is the place to start your Scuttlebutt experience!",
							'content' : content})

class AddTopic(webapp.RequestHandler):
	def get(self):
		content = """
		<form action='/admin/add_topic' method='post'>
		<table>
			<tr><td><input type="text" name="topicName" /></td><td>Name</td></tr>
			<tr><td><input type="submit" value="Add topic"></td><td></td></tr>
		</table>
		</form>
		"""

		self.response.headers['Content-Type'] = 'text/html'
		self.response.out.write(simple_html_template % {
							'title' : "Add New Topic",
							'description' : "Oooh, a new topic? I wonder what it'll be about!",
							'content' : content})
	def post(self):
		new_name = self.request.get('topicName')
		new_topic = NewsTopic(name=new_name)
		new_topic.save()
		self.redirect("/admin/list_topics")

class ListTopics(webapp.RequestHandler):
	def get(self):
		content = "<table>"
		news_topics = NewsTopic.getAll()
		for news_topic in news_topics:
			content += "<tr><td><a href='#'>%(name)s</a></td></tr>" % {'name' : news_topic.name}
		content += "</table>"
		
		self.response.headers['Content-Type'] = 'text/html'
		self.response.out.write(simple_html_template % {
							'title' : "List News Topics",
							'description' : "These are the topics we have in the database so far. Aren't they pretty? No? <a href='/admin/add_topic'>You can add your own!</a>",
							'content' : content})

ui_pages = [('/admin/', MainPage),
			('/admin/list_topics', ListTopics),
			('/admin/add_topic', AddTopic)]
application = webapp.WSGIApplication(
									 ui_pages,
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()