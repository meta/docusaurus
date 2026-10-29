function myCLIPlugin(context, options) {
  return {
    name: 'docusaurus-plugin',
    extendCli(cli) {
      cli
        .command('cliPlugin:test')
        .description('Run test cli command')
        .option('-t, --test-option', 'Test option')
        .action(() => {
          console.log('TEST ACTION');
        });

      cli
        .command('cliPlugin:legacy <input>', {hidden: true})
        .option('--label <label>', 'Label', 'default')
        .option('--no-cache', 'Disable cache')
        .action(async function (input, command) {
          await Promise.resolve();
          console.log(JSON.stringify({
            input,
            label: command.label,
            cache: command.cache,
            options: command.opts(),
            name: command.name(),
            args: command.args,
            thisIsCommand: this === command,
          }));
        });

      cli
        .command('cliPlugin:nested', {hidden: true})
        .command('run')
        .option('--label <label>')
        .action((command) => {
          console.log(JSON.stringify({
            label: command.label,
            options: command.opts(),
            args: command.args,
            parent: command.parent.name(),
          }));
        });

      cli
        .command('cliPlugin:modern', {hidden: true})
        .storeOptionsAsProperties(false)
        .allowExcessArguments(false)
        .option('--label <label>')
        .action((options, command) => {
          console.log(JSON.stringify({
            options,
            name: command.name(),
            separateOptions: options !== command,
          }));
        });
    },
  };
}

export default {
  title: 'My Site',
  url: 'https://example.com',
  baseUrl: '/',
  plugins: [myCLIPlugin],
};
