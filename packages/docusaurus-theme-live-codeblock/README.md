# `@docusaurus/theme-live-codeblock`

You can create live code editors with a code block `live` meta string.

Install

```bash
npm i @docusaurus/theme-live-codeblock # or yarn add @docusaurus/theme-live-codeblock
```

Modify your `docusaurus.config.js`

```diff
module.exports = {
  ...
+ themes: ['@docusaurus/theme-live-codeblock'],
  presets: ['@docusaurus/preset-classic']
  ...
}
```

Example:

    ```jsx live
    function Clock(props) {
      const [date, setDate] = useState(new Date());
      useEffect(() => {
        var timerID = setInterval(() => tick(), 1000);

        return function cleanup() {
          clearInterval(timerID);
        };
      });

      function tick() {
        setDate(new Date());
      }

      return (
        <div>
          <h2>It is {date.toLocaleTimeString()}.</h2>
        </div>
      );
    }
    ```
