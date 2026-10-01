import unittest
from lint_funnel import lint

GOOD = """---
niche: demo
display_name: Demo
archetype: personalization-quiz
subject: person
input: birth date
output: reading
screens: 3
monetization: web paywall
creative_screens:
  hook-a: 1
motion: stars drift
---
# Funnel Content — Demo

### 1. Hook A — Welcome
**Headline A:** Meet your {{name}} chart
**Body A:** Two minutes, five questions, one honest reading.
### 2. Paywall
**Headline A:** Your reading is ready
### 3. Last-chance offer
**Headline A:** One smaller option
"""

class LintTest(unittest.TestCase):
    def test_good_passes(self):
        self.assertEqual(lint(GOOD), [])

    def test_missing_frontmatter_key(self):
        errs = lint(GOOD.replace("motion: stars drift\n", ""))
        self.assertIn("frontmatter missing 'motion'", errs)

    def test_long_headline(self):
        errs = lint(GOOD.replace("Meet your {{name}} chart", "Meet your brand new personal birth chart today"))
        self.assertTrue(any(e.startswith("Headline A has 8 words") for e in errs))

    def test_long_body(self):
        errs = lint(GOOD.replace("Two minutes, five questions, one honest reading.",
                                 "It takes two short minutes and five simple questions to get one honest reading."))
        self.assertTrue(any(e.startswith("Body A has") for e in errs))

    def test_screen_count_mismatch(self):
        errs = lint(GOOD.replace("screens: 3", "screens: 4"))
        self.assertIn("frontmatter screens=4 but 3 screen headings", errs)

    def test_gap_in_numbering(self):
        errs = lint(GOOD.replace("### 3. Last-chance offer", "### 4. Last-chance offer"))
        self.assertTrue(any(e.startswith("screens not numbered") for e in errs))

    def test_no_paywall(self):
        errs = lint(GOOD.replace("### 2. Paywall", "### 2. Plans"))
        self.assertIn("no Paywall screen", errs)

    def test_no_offer(self):
        errs = lint(GOOD.replace("### 3. Last-chance offer", "### 3. Goodbye"))
        self.assertIn("no fallback/last-chance offer screen", errs)

    def test_placeholder(self):
        errs = lint(GOOD + "\nTBD pricing\n")
        self.assertIn("placeholder text (TBD/TODO/lorem)", errs)

    def test_placeholder_variations(self):
        """Test that placeholder detection is case-insensitive and matches variations."""
        test_cases = [
            ("TODO fix this", "placeholder text (TBD/TODO/lorem)"),
            ("todo: implement", "placeholder text (TBD/TODO/lorem)"),
            ("lorem ipsum dolor", "placeholder text (TBD/TODO/lorem)"),
            ("Lorem Ipsum text", "placeholder text (TBD/TODO/lorem)"),
        ]
        for text_addition, expected_err in test_cases:
            errs = lint(GOOD + f"\n{text_addition}\n")
            self.assertIn(expected_err, errs, f"Failed for: {text_addition}")

if __name__ == "__main__":
    unittest.main()
