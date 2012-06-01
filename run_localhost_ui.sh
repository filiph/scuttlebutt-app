echo
echo "* This runs Python's SimpleHTTPServer on /static/ui."
echo "* Navigate your favourite browser to http://0.0.0.0:8000/ScuttlebuttUI.html."
echo "* Hit Ctrl-C to stop."
echo

cd scuttlebutt/static/ui/
python -m SimpleHTTPServer
