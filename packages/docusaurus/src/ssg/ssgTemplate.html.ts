/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default `
<!DOCTYPE html>
<html <%~ it.html.attributes %>>
  <head>
    <meta charset="UTF-8">
    <meta name="generator" content="Docusaurus v<%= it.version %>">
    <%~ it.head.pageTags %>
    <%~ it.head.pluginTags %>
    <% it.assets.stylesheets.forEach((stylesheet) => { %>
      <link rel="stylesheet" href="<%= stylesheet %>" />
    <% }); %>
    <% it.assets.scripts.forEach((script) => { %>
      <script src="<%= script %>" defer></script>
    <% }); %>
  </head>
  <body <%~ it.body.attributes %>>
    <%~ it.body.preTags %>
    <div id="__docusaurus"><%~ it.body.appHtml %></div>
    <%~ it.body.postTags %>
  </body>
</html>
`;
