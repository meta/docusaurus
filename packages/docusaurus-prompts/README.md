# `@docusaurus/prompts`

Interactive prompts used by the Docusaurus CLIs (`create-docusaurus`, `docusaurus swizzle`, `docusaurus start`...).

It wraps the [`prompts`](https://npmjs.com/package/prompts) library as an implementation detail, so that:

- prompts are typed and return their answer directly
- the behavior is consistent when there is no answer (Ctrl+C, closed stdin): exit with code 1 and an error naming the CLI argument or option to use instead
- library workarounds (like the closed-stdin one) live in a single place
- tests can answer prompts with `injectAnswers()` without depending on the library

## APIs

- `askSelect({message, choices, answerHint?})`: pick one choice from a list.
- `askInput({message, answerHint?, initial?, validate?})`: free text input.
- `askConfirm({message, answerHint?, initial?})`: yes/no question.
- `askSearch({message, choices, answerHint?})`: searchable choice list (autocomplete).
- `injectAnswers(answers)`: test helper, answers the next prompts in order. An injected `Error` simulates a cancellation (Ctrl+C).
- `resetInjectedAnswers()`: test helper, stops answering prompts with injected answers.
