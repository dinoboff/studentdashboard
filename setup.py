from setuptools import setup, find_packages

setup(
    name="educationext.dashboard",
    version="0.1",
    packages=find_packages('api'),
    namespace_packages=['educationext'],
    package_dir={'':'api'},
    package_data={
        'educationext': ['*.*']
    }
)
