import base64, os, subprocess, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "build_export.py")
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")


def run(folder, out):
    return subprocess.run([sys.executable, SCRIPT, folder, "x-export", out], capture_output=True, text=True)


class BuildExportTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.folder = os.path.join(self.tmp.name, "f")
        os.makedirs(os.path.join(self.folder, "img"))
        with open(os.path.join(self.folder, "img", "x.png"), "wb") as f:
            f.write(PNG)
        self.out = os.path.join(self.tmp.name, "out")

    def tearDown(self):
        self.tmp.cleanup()

    def write_demo(self, html):
        with open(os.path.join(self.folder, "demo.html"), "w") as f:
            f.write(html)

    def test_embeds_images(self):
        self.write_demo("<!doctype html><script>const IMG=/*IMG-START*/{'img/x.png':'img/x.png'}/*IMG-END*/;</script>"
                        "<img src=\"img/x.png\"><div style=\"background:url(img/x.png)\"></div>")
        r = run(self.folder, self.out)
        self.assertEqual(r.returncode, 0, r.stderr)
        for p in (os.path.join(self.folder, "funnel.html"), os.path.join(self.out, "x-export.html")):
            s = open(p).read()
            self.assertIn("data:image/png;base64,", s)
            self.assertNotIn("'img/x.png':'img/x.png'", s)
            self.assertNotIn('src="img/x.png"', s)
            self.assertNotIn("url(img/x.png)", s)
        self.assertIn("1 images embedded", r.stdout)

    def test_alias_key_uses_value_file(self):
        with open(os.path.join(self.folder, "img", "y.png"), "wb") as f:
            f.write(PNG + b"y")
        self.write_demo("<!doctype html><script>const IMG=/*IMG-START*/{'img/a.png':'img/y.png'}/*IMG-END*/;</script>")
        r = run(self.folder, self.out)
        self.assertEqual(r.returncode, 0, r.stderr)
        s = open(os.path.join(self.folder, "funnel.html")).read()
        self.assertIn("'img/a.png':'data:image/png;base64," + base64.b64encode(PNG + b"y").decode(), s)

    def test_missing_image_file_is_dropped_with_warning(self):
        self.write_demo("<!doctype html><script>const IMG=/*IMG-START*/{'img/x.png':'img/x.png','img/gone.jpg':'img/gone.jpg'}/*IMG-END*/;</script>")
        r = run(self.folder, self.out)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("WARNING", r.stderr)
        self.assertIn("img/gone.jpg", r.stderr)
        s = open(os.path.join(self.folder, "funnel.html")).read()
        self.assertNotIn("gone.jpg", s)

    def test_missing_marker_fails(self):
        self.write_demo("<!doctype html><p>no marker</p>")
        r = run(self.folder, self.out)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("IMG", r.stderr)


if __name__ == "__main__":
    unittest.main()
