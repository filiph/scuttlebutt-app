## Checkout Code ##

Checkout the code in the [source](http://code.google.com/p/scuttlebutt-app/source/checkout) tab or [download](http://scuttlebutt-app.googlecode.com/files/scuttlebutt-v1.0.tar.gz) the files.

## Run Tests ##

The tests require installing the [PyMock](http://theblobshop.com/pymock/) module.

In the scuttlebutt-app directory run:

```
./run_tests.sh
```

Note: You may ignore the following error (it's an issue with PyMock). Just make sure the tests indicate OK at the end.

```
Exception RuntimeError: 'maximum recursion depth exceeded while calling a Python object' in <type 'exceptions.AttributeError'> ignored
```

## Local environment ##

To start the local server, run the following in the scuttlebutt-app directory:

```
./run_dev.sh
```

The first time you do this, you may need to run https://localhost:8080/report/create_feed in order to initialize the namespace.

You can view the app at: https://localhost:8080/

## Run front end with mocked data ##

Run the following in the scuttlebutt-app directory:

```
./run_localhost_ui.sh
```

## Deployment ##

To deploy your own instance to App Engine:

  1. Create an App Engine [application](https://appengine.google.com/) if you haven't already done so.
  1. Rename the application field in [app.yaml](http://code.google.com/p/scuttlebutt-app/source/browse/scuttlebutt/app.yaml) to your App Engine identifier.
  1. Create a psw.txt containing your App Engine application specific password or remove the --passin flag in the deploy\_app.sh script and enter your password everytime you deploy.
  1. Run the following in the scuttlebutt-app directory:
```
./deploy_app.sh
```

You can view the app at: https://application-id.appspot.com/

The first time you do this, you may need to run https://application-id.appspot.com/report/create_feed in order to initialize the namespace.