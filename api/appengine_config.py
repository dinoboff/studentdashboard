import site
import os.path
# add `lib` subdirectory to `sys.path`, so our `main` module can load
# third-party libraries.
site.addsitedir(os.path.join(os.path.dirname(__file__), 'lib'))