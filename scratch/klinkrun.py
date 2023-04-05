import sys, os, platform
import argparse

# todo: only for local env build
if platform.system() == "Darwin":
    pkgdir = os.path.join(os.getcwd(), '../../python/lib/python3.7/site-packages/')
    sys.path.insert(0, pkgdir)

print("sys path", sys.path)
print("os env", os.environ)
os.environ['LANG'] = 'en_US.UTF-8'
os.environ['LC_ALL'] = 'en_US.UTF-8'

import klink_core

argv = sys.argv[1:]
parser = argparse.ArgumentParser()
parser.add_argument('user', nargs='?', default=None)
parser.add_argument('pio', nargs='?', default=None)
parser.add_argument('ext', nargs='?', default=None)
parser.add_argument('pybin', nargs='?', default=None)
parser.add_argument('manager', nargs='?', default=None)
args = parser.parse_args(argv)

print("args", args)

klink_core.klinkServe(args)