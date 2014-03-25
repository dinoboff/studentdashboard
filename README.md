# studentdashboard

## Setup

### Requirements:

- python2.7
- virtualenv
- git
- make


### install/update google engine


Install/update google app engine in ~/.google_appengine
```
cd ~
rm -rf .google_appengine
wget https://commondatastorage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.1.zip
unzip google_appengine_1.9.1.zip
mv google_appengine .google_appengine
rm google_appengine_1.9.1.zip
```

Add google appengine to your path (skip it in nitrous.io):
```
echo "export PATH=$PATH:$HOME/.google_appengine" >> ~/.bashrc
```

### Python, node and bower

You can then clone your fork https://github.com/ChrisBoesch/studentdashboard:
```
git clone git@github.com:your-gihub-user-name/studentdashboard.git
cd studentdashboard
git remote add upstream git@github.com:SingaporeClouds/studentdashboard.git
```

Then setup python, node and bower.
```
make setup-dev
```

Remember to activate the virtual environement when working on the project:
```
source pyenv/bin/activate
```


## Development

To run the development server:
```
grunt dev
```

To run the tests automaticaly:
```
grunt autotest
```

To update the screenshots:
```
grunt screenshot
```
