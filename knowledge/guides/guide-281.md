# $modal guide

> Community guide for `$modal` (function) — package **ForgeScript**. Approved 2026-09-12. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-281)

`$modal[custom ID;title]` creates a modal (popup form) that users can interact with.

A modal must include at least one of the following components:
- [`$addLabel[]`](https://docs.botforge.org/function/$addLabel)
- [`$addTextInput[]`](https://docs.botforge.org/function/$addTextInput)
- [`$addTextDisplay[]`](https://docs.botforge.org/function/$addTextDisplay)

Example:
```fs
$modal[feedbackForm;Submit Feedback]
$addTextInput[feedback;Your thoughts;Paragraph;true;Type here...;;;1000]
```

<sub>Including a description requires using a [Label](https://docs.botforge.org/function/$addLabel) component instead.</sub>
```fs
$modal[feedbackForm;Submit Feedback]
$addLabel[Your thoughts;Tell us your feedback!;
  $addTextInput[feedback;;Paragraph;true]
]
```
