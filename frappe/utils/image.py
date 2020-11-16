# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals, print_function

import frappe

from frappe.utils import cint
from PIL import Image
import io
import os

RESAMPLING = {
	"Nearest": Image.NEAREST,
	"Box": Image.BOX,
	"Bilinear": Image.BILINEAR,
	"Hamming": Image.HAMMING,
	"Bicubic": Image.BICUBIC,
	"Lanczos": Image.LANCZOS
}

IMAGE_FORMAT_MAP = {
	"JPEG": "JPEG",
	"JPG": "JPEG",
	"PNG": "PNG",
	"BMP": "BMP",
	"GIF": "GIF"
}

def resize_images(path, maxdim=700):
	import Image
	size = (maxdim, maxdim)
	for basepath, folders, files in os.walk(path):
		for fname in files:
			extn = fname.rsplit(".", 1)[1]
			if extn in ("jpg", "jpeg", "png", "gif"):
				im = Image.open(os.path.join(basepath, fname))
				if im.size[0] > size[0] or im.size[1] > size[1]:
					im.thumbnail(size, Image.ANTIALIAS)
					im.save(os.path.join(basepath, fname))

					print("resized {0}".format(os.path.join(basepath, fname)))

def image_resize_url(path, size):
	return "{}?size={}".format(path.replace('/files/', '/resize/'), size)

def process_thumbnail(path, options):

	if ('.' not in path):
		return False

	filename, extn = os.path.splitext(path)
	extn = extn.replace(".", "")

	if extn not in ('jpg', 'jpeg', 'png', 'gif', 'bmp'):
		return False

	filepath = frappe.utils.get_site_path(path)
	buffer = io.BytesIO()

	try:
		img = Image.open(filepath)
	except IOError:
		raise NotFound

	# capture desired image width and height
	width = cint(options.width or 0) or cint(options.size or 0)
	height = cint(options.height or 0) or cint(options.size or 0)

	# default setting width to height and viceversa when either one is missing
	# also defaults to 300x300 pixels max size when size information is missing
	width = width or height or 300
	height = height or width or 300
	size = (width, height)

	# Defaults sampling to antialiasing
	resample = RESAMPLING.get(options.resample, "Bilinear")

	# Defaults quality for JPG only
	quality = cint(options.quality or 75)

	# Actual image resize
	img.thumbnail(size, resample)

	# Enforce image format
	format = IMAGE_FORMAT_MAP.get(extn.upper(), "JPEG")

	# default image options for PIL processing
	image_options = dict(
		optimize=True, 
		progressive=True, 
		quality=quality
	)

	if format == "GIF":
		# For GIF Animations only so we keep all frames
		image_options["save_all"] = True
	
	try:
		img.save(buffer, 
			format=format, 
			**image_options
		)
	except Exception:
		import traceback
		traceback.print_exc()


	# Return image bytes
	return buffer

