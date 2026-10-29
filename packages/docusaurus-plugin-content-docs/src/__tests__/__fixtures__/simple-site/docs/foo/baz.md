---
id: baz
title: baz
slug: bazSlug.html
pagination_label: baz pagination_label
tags:
  - tag 1
  - globalTag1
  - tag-1
  - tag 2
---

# Baz Markdown title

## Images

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg 'The Dojocat'

## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ 'title text!')

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)

## Footnotes

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

and multiple paragraphs.

[^second]: Footnote text.

## Definition lists

Term 1

: Definition 1 with lazy continuation.

Term 2 with _inline markup_

: Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1 ~ Definition 1

Term 2 ~ Definition 2a ~ Definition 2b

## Abbreviations

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLxxx" and so on.

\*[HTML]: Hyper Text Markup Language
